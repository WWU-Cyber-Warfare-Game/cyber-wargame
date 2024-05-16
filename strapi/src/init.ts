export function createActions() {
    createLeaderActions();
    createIntelligenceActions();
    createMilitaryActions();
}

function createLeaderActions() {
    const teamRole = 'leader';
    // Buff Intelligence
    strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Buff Intelligence',
                description: 'Increase the chance of success for all actions that the intelligence role performs.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
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
    strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Buff Intelligence',
                description: 'Increase the chance of success for all actions that the intelligence role performs.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
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

function createIntelligenceActions() {
    const teamRole = 'intelligence';

    // Reveal Node
    strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Reveal Node',
                description: 'Reveal a node in the enemy team\'s network.',
                duration: 30,
                teamRole: teamRole,
                type: 'offense',
                successRate: 50,
            },
            effects: [
                {
                    __component: 'effects.reveal-node',
                }
            ]
        }
    });

    // Stop Military Action
    strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Stop Military Action',
                description: 'If the enemy military is running an offensive action, stop it from succeeding.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
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

function createMilitaryActions() {
    const teamRole = 'military';

    // Attack Node
    strapi.entityService.create('api::action.action', {
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
                }
            },
            effects: [
                {
                    __component: 'effects.attack-node',
                }
            ]
        }
    });

    // Defend Node
    strapi.entityService.create('api::action.action', {
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
                }
            },
            effects: [
                {
                    __component: 'effects.defend-node',
                }
            ]
        }
    });

    // Stop Intelligence Action
    strapi.entityService.create('api::action.action', {
        data: {
            action: {
                name: 'Stop Intelligence Action',
                description: 'If the enemy intelligence is running an offensive action, stop it from succeeding.',
                duration: 30,
                teamRole: teamRole,
                type: 'defense',
                successRate: 50,
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
    strapi.entityService.create('api::action.action', {
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
                }
            },
            effects: [
                {
                    __component: 'effects.defend-edge'
                }
            ]
        }
    });

    // Compromise Firewall
    strapi.entityService.create('api::action.action', {
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
                }
            },
            effects: [
                {
                    __component: 'effects.attack-edge'
                }
            ]
        }
    });
}