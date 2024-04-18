import { Server, Socket } from 'socket.io';
import { PendingAction, Action, TeamRole, User, PendingActionRequest, ActionType, ActionCompleteRequest, Message } from './types';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Converts minutes to milliseconds
 * @param min Time in minutes
 * @returns Time in milliseconds
 */
const minToMs = (min: number) => min * 60 * 1000;

/**
 * Returns the user room string (both usernames in alphabetical order, separated by an ampersand)
 * 
 * e.g. `user1&user2`
 * @param sender Sender's username
 * @param receiver Receiver's username
 * @returns Room name
 */
function getRoomName(sender: string, receiver: string) {
  return [sender, receiver].sort().join('&');
}

/**
 * Checks the user's token
 * @param jwt User's JWT
 * @returns User ID if the token is valid, otherwise `null`
 */
async function checkToken(jwt: string) {
  if (!jwt) {
    return null;
  }
  try {
    const res = await strapi.plugins['users-permissions'].services.jwt.verify(jwt);
    return res.id as number;
  } catch (error) {
    return null;
  }
}

/**
 * Checks if the receiver is valid (i.e. exists and is on the same team as the sender)
 * @param userId The sender's user ID
 * @param receiver The receiver's username
 * @returns `true` if the receiver is valid, otherwise `false`
 */
async function checkReceiver(userId: number, receiver: string) {
  const res = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
    populate: ['team']
  });
  const teamName = res.team.name;
  const teammates = await strapi.entityService.findMany('plugin::users-permissions.user', {
    fields: ['username'],
    populate: ['team'],
    filters: {
      username: receiver,
      team: {
        name: teamName
      }
    }
  });
  return teammates.length > 0;
}

/**
 * Gets a user's info from their username
 * @param username The user's username
 * @returns The user's info if they exist, otherwise `null`
 */
async function getUser(username: string) {
  const res = await strapi.entityService.findMany('plugin::users-permissions.user', {
    filters: {
      username: username
    },
    populate: '*'
  });
  if (res.length === 0) {
    console.error('user ' + username + ' does not exist');
    return null;
  }
  const user: User = {
    username: res[0].username,
    email: res[0].email,
    teamRole: res[0].teamRole as TeamRole,
    team: res[0].team.name
  };
  return user;
}

/**
 * Checks if user can perform action and returns the action if they can
 * @param username The user's username
 * @param actionId The ID of the action to check
 * @returns The action if the user can perform it, otherwise `null`
 */
async function checkAction(username: string, actionId: number) {
  const user = await getUser(username);
  const res = await strapi.entityService.findOne('api::action.action', actionId, {
    populate: '*'
  });
  if (!res) {
    console.error('user ' + username + ' attempted to perform action ' + actionId + ' that does not exist');
    return null;
  }
  const action: Action = {
    id: res.id as number,
    name: res.action.name,
    duration: res.action.duration,
    description: res.action.description,
    teamRole: res.action.teamRole as TeamRole,
    type: res.action.type as ActionType
  };
  if (user.teamRole !== action.teamRole) {
    console.error('user ' + username + ' attempted to perform action ' + action.name + ' that does not match their team role');
    return null;
  }
  return action;
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ /* strapi */ }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: [`${FRONTEND_URL}`], //dashboard, can add other origins
        methods: ['GET', 'POST'],
      },
    });

    // frontend socket
    const frontendSocket = io;

    // game logic process socket
    // TODO: add token verification
    const gameLogicSocket = io.of('/game-logic');

    gameLogicSocket.on('connection', (socket) => {
      console.log('game-logic connected');

      // prints string to console, for debugging
      socket.on('print', (str: string) => {
        console.log(str);
      });

      // listen for action complete
      socket.on('actionComplete', async (actionCompleteRequest: ActionCompleteRequest) => {
        console.log('action complete: ' + actionCompleteRequest.pendingActionId);

        // add action to resolved queue
        const pendingActionRes = await strapi.entityService.findOne('api::pending-action.pending-action',
          actionCompleteRequest.pendingActionId,
          {
            populate: '*'
          }
        );
        await strapi.entityService.create('api::resolved-action.resolved-action', {
          data: {
            user: pendingActionRes.user,
            date: new Date(),
            action: pendingActionRes.action,
            endState: actionCompleteRequest.endState
          }
        });

        // remove action from pending queue
        await strapi.entityService.delete('api::pending-action.pending-action', actionCompleteRequest.pendingActionId);

        // parse and apply action effects
        const effects = (await strapi.entityService.findOne('api::action.action', pendingActionRes.actionId, {
          populate: ['effects']
        })).effects;

        const user = await getUser(pendingActionRes.user);

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
              const id = effect.myTeam ? playerTeam.id : otherTeam.id;
              
              // probably a better way to do this
              switch (effect.teamRole) {
                case 'leader':
                  await strapi.entityService.update('api::team.team', id, {
                    data: {
                      leaderModifiers: {
                        offense: playerTeam.leaderModifiers.offense,
                        defense: playerTeam.leaderModifiers.defense,
                        buff: playerTeam.leaderModifiers.buff + effect.buff
                      }
                    }
                  });
                  break;
                case 'intelligence':
                  await strapi.entityService.update('api::team.team', id, {
                    data: {
                      intelligenceModifiers: {
                        offense: playerTeam.intelligenceModifiers.offense,
                        defense: playerTeam.intelligenceModifiers.defense,
                        buff: playerTeam.intelligenceModifiers.buff + effect.buff
                      }
                    }
                  });
                  break;
                case 'military':
                  await strapi.entityService.update('api::team.team', id, {
                    data: {
                      militaryModifiers: {
                        offense: playerTeam.militaryModifiers.offense,
                        defense: playerTeam.militaryModifiers.defense,
                        buff: playerTeam.militaryModifiers.buff + effect.buff
                      }
                    }
                  });
                  break;
                case 'diplomat':
                  await strapi.entityService.update('api::team.team', id, {
                    data: {
                      diplomatModifiers: {
                        offense: playerTeam.diplomatModifiers.offense,
                        defense: playerTeam.diplomatModifiers.defense,
                        buff: playerTeam.diplomatModifiers.buff + effect.buff
                      }
                    }
                  });
                  break;
                case 'media':
                  await strapi.entityService.update('api::team.team', id, {
                    data: {
                      mediaModifiers: {
                        offense: playerTeam.mediaModifiers.offense,
                        defense: playerTeam.mediaModifiers.defense,
                        buff: playerTeam.mediaModifiers.buff + effect.buff
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
                gameLogicSocket.emit('deleteAction', offenseAction.id);
              }
              break;
          }
        });

        // unlock queue
        gameLogicSocket.emit('queueUnlock');

        // emit action complete to user
        frontendSocket.emit('actionComplete');
      });
    });

    frontendSocket.on('connection', async (socket) => {
      // check user jwt
      const userId = await checkToken(socket.handshake.auth.token);
      if (!socket.handshake.auth.token || !userId) {
        console.error('user connected without valid token, disconnecting...');
        socket.emit('error', 'Invalid token');
        socket.disconnect();
        return;
      }

      // join user to their own room
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      socket.join(user.username);

      console.log('user connected with ID ' + socket.id + ' at ' + new Date().toISOString());

      // listen for messages, add to strapi, and emit to room
      socket.on('message', async (message: Message) => {
        const validReceiver = await checkReceiver(userId, message.receiver);
        if (!validReceiver) {
          console.error('user ' + userId + ' attempted to send message to invalid receiver ' + message.receiver);
          socket.emit('error', 'Invalid receiver');
          socket.disconnect();
          return;
        }
        socket.to(getRoomName(message.sender, message.receiver)).emit('message', message);
        const res = await strapi.entityService.create('api::message.message', {
          data: {
            message: message.message,
            date: message.date,
            sender: message.sender,
            receiver: message.receiver,
          }
        });
      });

      // join room when user connects
      socket.on('join-room', async (users: string[]) => {
        const validReceiver = await checkReceiver(userId, users[1]);
        if (!validReceiver) {
          console.error('user ' + userId + ' attempted to join room with invalid receiver ' + users[1]);
          socket.emit('error', 'Invalid receiver');
          socket.disconnect();
          return;
        }
        socket.join(getRoomName(users[0], users[1]));
      });

      // listens for pending actions
      socket.on('startAction', async (pendingActionReq: PendingActionRequest) => {
        console.log('action received');

        // check if action is valid
        const action = await checkAction(pendingActionReq.user, pendingActionReq.action);
        if (!action) {
          socket.emit('error', 'Invalid action');
          return;
        }

        // check if user is already performing an action
        const pendingActions = await strapi.entityService.findMany('api::pending-action.pending-action', {
          filters: {
            user: pendingActionReq.user
          }
        });
        if (pendingActions.length > 0) {
          socket.emit('error', 'User already performing action');
          return;
        }

        // add action to pending queue
        const res = await strapi.entityService.create('api::pending-action.pending-action', {
          data: {
            user: pendingActionReq.user,
            date: new Date(Date.now() + minToMs(action.duration)),
            action: action,
            actionId: action.id
          }
        });

        // emit action to game logic
        console.log('sending to gameSocket');
        const pendingAction: PendingAction = {
          id: res.id as number,
          user: pendingActionReq.user,
          date: new Date(res.date),
          action: action
        };
        gameLogicSocket.emit('pendingAction', pendingAction);
      });
    });
  }
};
