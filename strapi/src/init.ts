/**
 * Loads actions into Strapi.
 */
export async function createActions() {
    await createLeaderActions();
    await createIntelligenceActions();
    await createMilitaryActions();
}

/**
 * Loads the teams and their networks into Strapi.
 */
export async function createTeams() {
    const team1 = await createTeam('Team 1');
    const team2 = await createTeam('Team 2');
    await createNetworkPreset1(team1.id as number);
    await createNetworkPreset2(team2.id as number);
}

async function createLeaderActions() {
    const teamRole = 'leader';
    // Buff Teammate
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Buff Teammate',
                description: 'Increase the chance of success for all actions that the teammate performs in the future.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
                cost: 3,
                targets: {
                    target: 'player',
                    myTeam: true,
                }
            },
            effects: [
                {
                    __component: 'effects.buff-debuff-targeted',
                    buff: 1,
                }
            ]
        }
    });

    // Distribute Funds (1)
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Distribute Funds (1)',
                description: 'Give funds to another team member to use for actions.',
                duration: 1,
                teamRole: teamRole,
                type: 'defense',
                successRate: 100,
                cost: 0,
            },
            effects: [
                {
                    __component: 'effects.distribute-funds',
                    amount: 1,
                }
            ]
        }
    });

    // Distribute Funds (5)
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Distribute Funds (5)',
                description: 'Give funds to another team member to use for actions.',
                duration: 1,
                teamRole: teamRole,
                type: 'defense',
                successRate: 100,
                cost: 0,
            },
            effects: [
                {
                    __component: 'effects.distribute-funds',
                    amount: 5,
                }
            ]
        }
    });

    // Distribute Funds (10)
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Distribute Funds (10)',
                description: 'Give funds to another team member to use for actions.',
                duration: 1,
                teamRole: teamRole,
                type: 'defense',
                successRate: 100,
                cost: 0,
            },
            effects: [
                {
                    __component: 'effects.distribute-funds',
                    amount: 10,
                }
            ]
        }
    });

    // Distribute Funds (20)
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Distribute Funds (20)',
                description: 'Give funds to another team member to use for actions.',
                duration: 1,
                teamRole: teamRole,
                type: 'defense',
                successRate: 100,
                cost: 0,
            },
            effects: [
                {
                    __component: 'effects.distribute-funds',
                    amount: 20,
                }
            ]
        }
    });
}

async function createIntelligenceActions() {
    const teamRole = 'intelligence';

    // Reveal Node
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Reveal Node',
                description: 'Reveal a node in the enemy team\'s network.',
                duration: 30,
                teamRole: teamRole,
                type: 'offense',
                successRate: 50,
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.reveal-node',
                }
            ]
        }
    });

    // Stop Military Action
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Stop Military Action',
                description: 'If the enemy military is running an offensive action, stop it from succeeding.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.stop-offense-action',
                    teamRole: 'military',
                }
            ]
        }
    });
}

async function createMilitaryActions() {
    const teamRole = 'military';

    // Attack Node
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Attack Node',
                description: 'Attack a node in the enemy team\'s network.',
                duration: 30,
                teamRole: teamRole,
                type: 'offense',
                successRate: 50,
                targets: {
                    target: 'node',
                    myTeam: false,
                },
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.attack-node',
                }
            ]
        }
    });

    // Defend Node
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Defend Node',
                description: 'Defend a node in your team\'s network.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
                targets: {
                    target: 'node',
                    myTeam: true,
                },
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.defend-node',
                }
            ]
        }
    });

    // Stop Intelligence Action
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Stop Intelligence Action',
                description: 'If the enemy intelligence is running an offensive action, stop it from succeeding.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.stop-offense-action',
                    teamRole: 'intelligence',
                }
            ]
        }
    });

    // Firewall
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Firewall',
                description: 'Protect a network connection and make it harder for the enemy to attack it.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
                targets: {
                    target: 'edge',
                    myTeam: true,
                },
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.defend-edge'
                }
            ]
        }
    });

    // Compromise Firewall
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Compromise Firewall',
                description: 'Weaken a firewall on the enemy team\'s network.',
                duration: 30,
                teamRole: teamRole,
                type: 'offense',
                successRate: 50,
                targets: {
                    target: 'edge',
                    myTeam: false,
                },
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.attack-edge'
                }
            ]
        }
    });
}

async function createTeam(name: string) {
    return await strapi.entityService.create('api::team.team', {
        data: {
            name: name,
            victoryPoints: 0,
            leaderModifiers: {
                offense: 0,
                defense: 0,
                buff: 0,
            },
            intelligenceModifiers: {
                offense: 0,
                defense: 0,
                buff: 0,
            },
            militaryModifiers: {
                offense: 0,
                defense: 0,
                buff: 0,
            },
            mediaModifiers: {
                offense: 0,
                defense: 0,
                buff: 0,
            },
            diplomatModifiers: {
                offense: 0,
                defense: 0,
                buff: 0,
            },
        }
    });
}

async function createNetworkPreset1(teamId: number) {
    // create nodes
    const router1 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Router 1',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const router2 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Router 2',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const devServer = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Dev Server',
            team: teamId,
            defense: 5,
            isCoreNode: true,
            visible: false,
            compromised: false,
        }
    });
    const switch1 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Switch 1',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const switch2 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Switch 2',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const database = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Database',
            team: teamId,
            defense: 5,
            isCoreNode: true,
            visible: false,
            compromised: false,
        }
    });
    const switch3 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Switch 3',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const productionServer = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Production Server',
            team: teamId,
            defense: 5,
            isCoreNode: true,
            visible: false,
            compromised: false,
        }
    });

    // create edges
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: router1.id,
            target: devServer.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: router2.id,
            target: devServer.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: devServer.id,
            target: switch1.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: devServer.id,
            target: switch2.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: switch1.id,
            target: database.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: switch2.id,
            target: database.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: database.id,
            target: switch3.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: switch3.id,
            target: productionServer.id,
            defense: 0,
        }
    });
}

async function createNetworkPreset2(teamId: number) {
    // create nodes
    const router1 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Router 1',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const router2 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Router 2',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const devServer = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Dev Server',
            team: teamId,
            defense: 5,
            isCoreNode: true,
            visible: false,
            compromised: false,
        }
    });
    const switch1 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Switch 1',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const switch2 = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Switch 2',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const webServer = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Web Server',
            team: teamId,
            defense: 5,
            isCoreNode: true,
            visible: false,
            compromised: false,
        }
    });
    const pc = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'PC',
            team: teamId,
            defense: 3,
            isCoreNode: false,
            visible: false,
            compromised: false,
        }
    });
    const productionServer = await strapi.entityService.create('api::node.node', {
        data: {
            name: 'Production Server',
            team: teamId,
            defense: 5,
            isCoreNode: true,
            visible: false,
            compromised: false,
        }
    });

    // create edges
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: router1.id,
            target: devServer.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: router2.id,
            target: devServer.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: devServer.id,
            target: switch1.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: devServer.id,
            target: switch2.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: switch1.id,
            target: webServer.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: switch2.id,
            target: pc.id,
            defense: 0,
        }
    });
    await strapi.entityService.create('api::edge.edge', {
        data: {
            source: switch2.id,
            target: productionServer.id,
            defense: 0,
        }
    });
}