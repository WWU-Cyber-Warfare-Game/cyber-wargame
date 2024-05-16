import { User } from './types';
import { getUser } from './utilities';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Server, Namespace } from 'socket.io';
import ActionQueue from './queue';
import { DEFENSE_RATE } from './consts';
import { setWinner } from './game-state';
type SocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

/**
 * Applies the effects of an action
 * @param actionId The ID of the action to apply effects for
 * @param user The user who performed the action
 * @param actionQueue The action queue object
 * @param frontend The frontend socket server
 * @param targetNodeId The ID of the node targeted by the action
 * @param targetEdgeId The ID of the edge targeted by the action
 */
export default async function applyEffects(actionId: number, user: User, actionQueue: ActionQueue, frontend: SocketServer, targetNodeId?: number, targetEdgeId?: number) {
    console.log('targetNodeId:', targetNodeId);
    console.log('targetEdgeId:', targetEdgeId);
    
    const effects = (await strapi.entityService.findOne('api::action.action', actionId, {
        populate: ['effects']
    })).effects;

    const playerTeam = (await strapi.entityService.findMany('api::team.team', {
        filters: {
            name: user.team
        },
        populate: '*'
    }))[0];

    const otherTeam = (await strapi.entityService.findMany('api::team.team', {
        filters: {
            $not: {
                name: user.team
            }
        },
        populate: '*'
    }))[0];

    const targetNode = targetNodeId ? await strapi.entityService.findOne('api::node.node', targetNodeId) : null;
    const targetEdge = targetEdgeId ? await strapi.entityService.findOne('api::edge.edge', targetEdgeId) : null;

    effects.forEach(async (effect) => {
        switch (effect.__component) {

            // add victory points to user's team or opposing team
            case 'effects.add-victory-points':
                console.log('EFFECT: adding victory points');
                if (effect.myTeam) {
                    // add victory points to user's team
                    await strapi.entityService.update('api::team.team', playerTeam.id, {
                        data: {
                            victoryPoints: playerTeam.victoryPoints + effect.points
                        }
                    });
                } else {
                    // add victory points to opposing team
                    await strapi.entityService.update('api::team.team', otherTeam.id, {
                        data: {
                            victoryPoints: otherTeam.victoryPoints + effect.points
                        }
                    });
                }
                break;

            // add a buff or debuff to user
            case 'effects.buff-debuff':
                console.log('EFFECT: buffing/debuffing');
                const team = effect.myTeam ? playerTeam : otherTeam;
                switch (effect.teamRole) {
                    case 'leader':
                        await strapi.entityService.update('api::team.team', team.id, {
                            data: {
                                leaderModifiers: {
                                    offense: team.leaderModifiers.offense,
                                    defense: team.leaderModifiers.defense,
                                    buff: team.leaderModifiers.buff + effect.buff
                                }
                            }
                        });
                        break;
                    case 'intelligence':
                        await strapi.entityService.update('api::team.team', team.id, {
                            data: {
                                intelligenceModifiers: {
                                    offense: team.intelligenceModifiers.offense,
                                    defense: team.intelligenceModifiers.defense,
                                    buff: team.intelligenceModifiers.buff + effect.buff
                                }
                            }
                        });
                        break;
                    case 'military':
                        await strapi.entityService.update('api::team.team', team.id, {
                            data: {
                                militaryModifiers: {
                                    offense: team.militaryModifiers.offense,
                                    defense: team.militaryModifiers.defense,
                                    buff: team.militaryModifiers.buff + effect.buff
                                }
                            }
                        });
                        break;
                    case 'diplomat':
                        await strapi.entityService.update('api::team.team', team.id, {
                            data: {
                                diplomatModifiers: {
                                    offense: team.diplomatModifiers.offense,
                                    defense: team.diplomatModifiers.defense,
                                    buff: team.diplomatModifiers.buff + effect.buff
                                }
                            }
                        });
                        break;
                    case 'media':
                        await strapi.entityService.update('api::team.team', team.id, {
                            data: {
                                mediaModifiers: {
                                    offense: team.mediaModifiers.offense,
                                    defense: team.mediaModifiers.defense,
                                    buff: team.mediaModifiers.buff + effect.buff
                                }
                            }
                        });
                        break;
                }
                break;

            // stop an offense action
            case 'effects.stop-offense-action':
                console.log('EFFECT: stopping offense action');
                const res = await strapi.entityService.findMany('api::pending-action.pending-action', {
                    filters: {
                        action: {
                            type: 'offense',
                            teamRole: effect.teamRole
                        }
                    },
                    populate: '*'
                });
                const offenseAction = res.filter(async (action) => {
                    const actionUser = await getUser(action.user);
                    return actionUser.team !== user.team;
                })[0];
                if (offenseAction) {
                    await strapi.entityService.create('api::resolved-action.resolved-action', {
                        data: {
                            user: offenseAction.user,
                            date: new Date(),
                            action: offenseAction.action,
                            endState: 'stopped'
                        }
                    });
                    await strapi.entityService.delete('api::pending-action.pending-action', offenseAction.id);
                    actionQueue.deleteAction(offenseAction.id as number);
                }
                break;

            // reveal a node
            case 'effects.reveal-node':
                // get player team's nodes and edges
                const nodes = await strapi.entityService.findMany('api::node.node', {
                    populate: '*',
                    filters: {
                        team: {
                            id: otherTeam.id
                        }
                    }
                });
                const edges = await strapi.entityService.findMany('api::edge.edge', {
                    populate: '*',
                    filters: {
                        source: {
                            team: {
                                id: otherTeam.id
                            }
                        }
                    }
                });

                if (nodes.filter((node) => node.visible).length === 0) {
                    // reveal an outer node (a node that has no incoming edges)
                    const outerNodes = nodes.filter((node) => edges.filter((edge) => edge.target.id === node.id).length === 0);
                    const randomNode = outerNodes[Math.floor(Math.random() * outerNodes.length)];
                    await strapi.entityService.update('api::node.node', randomNode.id, {
                        data: {
                            visible: true
                        }
                    });
                } else {
                    // reveal a node that is not visible that is connected to a visible node
                    const connectedEdges = edges.filter((edge) => edge.source.visible && !edge.target.visible);
                    if (connectedEdges.length > 0)
                        await strapi.entityService.update('api::node.node',
                            connectedEdges[Math.floor(Math.random() * connectedEdges.length)].target.id,
                            {
                                data: {
                                    visible: true
                                }
                            });
                }
                break;

            // compromise a node
            case 'effects.attack-node':
                console.log('EFFECT: attacking node');
                if (!targetNodeId) console.error('No target node ID provided for attack-node effect');
                await strapi.entityService.update('api::node.node', targetNodeId, {
                    data: {
                        compromised: true
                    }
                });
                break;

            // increase a node's defense
            case 'effects.defend-node':
                console.log('EFFECT: defending node');
                if (!targetNodeId) console.error('No target node ID provided for defend-node effect');
                await strapi.entityService.update('api::node.node', targetNodeId, {
                    data: {
                        defense: targetNode.defense + DEFENSE_RATE
                    }
                });
                break;

            // increase an edge's defense
            case 'effects.defend-edge':
                console.log('EFFECT: defending edge');
                if (!targetEdgeId) console.error('No target edge ID provided for defend-edge effect');
                await strapi.entityService.update('api::edge.edge', targetEdgeId, {
                    data: {
                        defense: targetEdge.defense + DEFENSE_RATE
                    }
                });
                break;

            // uncompromise a node
            case 'effects.secure-node':
                console.log('EFFECT: securing node');
                if (!targetNodeId) console.error('No target node ID provided for secure-node effect');
                await strapi.entityService.update('api::node.node', targetNodeId, {
                    data: {
                        compromised: false
                    }
                });
                break;
            
            // decreases the defense of an edge
            case 'effects.attack-edge':
                console.log('EFFECT: attacking edge');
                if (!targetEdgeId) console.error('No target edge ID provided for attack-edge effect');
                await strapi.entityService.update('api::node.node', targetNodeId, {
                    data: {
                        defense: targetNode.defense - DEFENSE_RATE
                    }
                });
                break;
            }
    });

    // reset the buff to 0 if there is no buff/debuff effect
    if (effects.filter((effect) => effect.__component === 'effects.buff-debuff').length === 0) {
        console.log('EFFECT: resetting buff');
        switch (user.teamRole) {
            case 'leader':
                await strapi.entityService.update('api::team.team', playerTeam.id, {
                    data: {
                        leaderModifiers: {
                            offense: playerTeam.leaderModifiers.offense,
                            defense: playerTeam.leaderModifiers.defense,
                            buff: 0
                        }
                    }
                });
                break;
            case 'intelligence':
                await strapi.entityService.update('api::team.team', playerTeam.id, {
                    data: {
                        intelligenceModifiers: {
                            offense: playerTeam.intelligenceModifiers.offense,
                            defense: playerTeam.intelligenceModifiers.defense,
                            buff: 0
                        }
                    }
                });
                break;
            case 'military':
                await strapi.entityService.update('api::team.team', playerTeam.id, {
                    data: {
                        militaryModifiers: {
                            offense: playerTeam.militaryModifiers.offense,
                            defense: playerTeam.militaryModifiers.defense,
                            buff: 0
                        }
                    }
                });
                break;
            case 'diplomat':
                await strapi.entityService.update('api::team.team', playerTeam.id, {
                    data: {
                        diplomatModifiers: {
                            offense: playerTeam.diplomatModifiers.offense,
                            defense: playerTeam.diplomatModifiers.defense,
                            buff: 0
                        }
                    }
                });
                break;
            case 'media':
                await strapi.entityService.update('api::team.team', playerTeam.id, {
                    data: {
                        mediaModifiers: {
                            offense: playerTeam.mediaModifiers.offense,
                            defense: playerTeam.mediaModifiers.defense,
                            buff: 0
                        }
                    }
                });
                break;
        }
    }

    // check if all core nodes have been compromised and set victory state
    const nodes = await strapi.entityService.findMany('api::node.node', {
        populate: '*',
        filters: {
            team: {
                id: otherTeam.id,
            },
            isCoreNode: true
        }
    });
    if (nodes.every((node) => node.compromised)) {
        setWinner(playerTeam.id as number, frontend);
    }
}