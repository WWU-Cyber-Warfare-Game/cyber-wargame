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
    await createTeam('Team 1');
    await createTeam('Team 2');
    // TODO: Create networks for each team
}

async function createLeaderActions() {
    const teamRole = 'leader';
    // Buff Intelligence
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Buff Intelligence',
                description: 'Increase the chance of success for all actions that the intelligence role performs.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.buff-debuff',
                    teamRole: 'intelligence',
                    buff: 1,
                    myTeam: true,
                }
            ]
        }
    });

    // Buff Military
    await strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Buff Intelligence',
                description: 'Increase the chance of success for all actions that the intelligence role performs.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
                cost: 3,
            },
            effects: [
                {
                    __component: 'effects.buff-debuff',
                    teamRole: 'military',
                    buff: 1,
                    myTeam: true,
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
    await strapi.entityService.create('api::team.team', {
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