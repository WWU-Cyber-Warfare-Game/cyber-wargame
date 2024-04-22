import { User } from './types';
import { getUser } from './utilities';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Server, Namespace } from 'socket.io';
type SocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

/**
 * Applies the effects of an action
 * @param actionId The ID of the action to apply effects for
 * @param user The user who performed the action
 * @param gameLogic The socket server for the game logic
 */
export default async function applyEffects(actionId: number, user: User, gameLogic: SocketServer) {
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
                    gameLogic.emit('deleteAction', offenseAction.id);
                }
                break;
        }
    });

    // reset the buff to 0 if there is no buff/debuff effect
    if (effects.filter((effect) => effect.__component === 'effects.buff-debuff').length === 0) {
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
}