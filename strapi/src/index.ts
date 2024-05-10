import { Server, Namespace, Socket } from 'socket.io';
import { PendingAction, Action, TeamRole, User, PendingActionRequest, ActionType, ActionCompleteRequest, Message, GameState } from './types';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { getUser } from './utilities';
import applyEffects from './effects';
import { MODIFIER_RATE } from './consts';
import ActionQueue from './queue';
type SocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
let actionQueue: ActionQueue;
let gameEndCheckerInterval: NodeJS.Timeout;

/**
 * Converts minutes to milliseconds
 * @param min Time in minutes
 * @returns Time in milliseconds
 */
const minToMs = (min: number) => min * 60 * 1000;

/**
 * Returns a random boolean based on the success rate
 * @param successRate The percentage chance of success (0-100)
 * @param username The username of the user performing the action
 * @returns `true` if successful, otherwise `false`
 */
async function getSuccess(successRate: number, username: string, actionType: ActionType) {
  const user = await strapi.entityService.findMany('plugin::users-permissions.user', {
    filters: {
      username: username
    },
    populate: ['team']
  });
  const res = await strapi.entityService.findOne('api::team.team', user[0].team.id, {
    populate: '*'
  });
  let buff: number, modifier: number;
  switch (user[0].teamRole) {
    case 'leader':
      if (actionType === ActionType.Offense) modifier = res.leaderModifiers.offense;
      else modifier = res.leaderModifiers.defense;
      buff = res.leaderModifiers.buff;
      break;
    case 'intelligence':
      if (actionType === ActionType.Offense) modifier = res.intelligenceModifiers.offense;
      else modifier = res.intelligenceModifiers.defense;
      buff = res.intelligenceModifiers.buff;
      break;
    case 'military':
      if (actionType === ActionType.Offense) modifier = res.militaryModifiers.offense;
      else modifier = res.militaryModifiers.defense;
      buff = res.militaryModifiers.buff;
      break;
    case 'diplomat':
      if (actionType === ActionType.Offense) modifier = res.diplomatModifiers.offense;
      else modifier = res.diplomatModifiers.defense;
      buff = res.diplomatModifiers.buff;
      break;
    case 'media':
      if (actionType === ActionType.Offense) modifier = res.mediaModifiers.offense;
      else modifier = res.mediaModifiers.defense;
      buff = res.mediaModifiers.buff;
      break;
  }
  const rand = Math.floor(Math.random() * 101) + ((modifier + buff) * MODIFIER_RATE);
  const success = rand >= 100 - successRate;
  return success;
}

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
    type: res.action.type as ActionType,
    successRate: res.action.successRate
  };
  if (user.teamRole !== action.teamRole) {
    console.error('user ' + username + ' attempted to perform action ' + action.name + ' that does not match their team role');
    return null;
  }
  return action;
}

/**
 * Handles the completion of an action
 * @param actionCompleteRequest The action complete request
 * @param frontend The frontend socket server
 */
async function actionComplete(actionCompleteRequest: ActionCompleteRequest, frontend: SocketServer) {
  console.log('action complete: ' + actionCompleteRequest.pendingActionId);

  // add action to resolved queue
  const pendingActionRes = await strapi.entityService.findOne('api::pending-action.pending-action',
    actionCompleteRequest.pendingActionId,
    {
      populate: '*'
    }
  );
  const successRate = pendingActionRes.action.successRate;
  const endState = await getSuccess(successRate, pendingActionRes.user, pendingActionRes.action.type as ActionType) ? 'success' : 'fail';
  console.log('end state: ' + endState);
  await strapi.entityService.create('api::resolved-action.resolved-action', {
    data: {
      user: pendingActionRes.user,
      date: new Date(),
      action: pendingActionRes.action,
      endState: endState
    }
  });

  // remove action from pending queue
  await strapi.entityService.delete('api::pending-action.pending-action', actionCompleteRequest.pendingActionId);

  // parse and apply action effects
  if (endState === 'success') {
    const user = await getUser(pendingActionRes.user);
    await applyEffects(
      pendingActionRes.actionId,
      user,
      actionQueue,
      pendingActionRes.targetNode && pendingActionRes.targetNode.id as number,
      pendingActionRes.targetEdge && pendingActionRes.targetEdge.id as number
    );
  }

  // emit action complete to user
  frontend.emit('actionComplete');
}

/**
 * Listen for messages, add to Strapi, and emit to room
 * @param message The message that was received
 * @param userId The ID of the user who sent the message
 * @param socket The socket of the user who sent the message
 */
async function receiveMessage(message: Message, userId: number, socket: Socket) {
  const validReceiver = await checkReceiver(userId, message.receiver);
  if (!validReceiver) {
    console.error('user ' + userId + ' attempted to send message to invalid receiver ' + message.receiver);
    socket.emit('error', 'Invalid receiver');
    socket.disconnect();
    return;
  }
  socket.to(getRoomName(message.sender, message.receiver)).emit('message', message);
  await strapi.entityService.create('api::message.message', {
    data: {
      message: message.message,
      date: message.date,
      sender: message.sender,
      receiver: message.receiver,
    }
  });
}

/**
 * Joins a user to a room
 * @param users The usernames of the users in the room
 * @param userId The ID of the user who is joining the room
 * @param socket The socket of the user who is joining the room
 */
async function joinRoom(users: string[], userId: number, socket: Socket) {
  const validReceiver = await checkReceiver(userId, users[1]);
  if (!validReceiver) {
    console.error('user ' + userId + ' attempted to join room with invalid receiver ' + users[1]);
    socket.emit('error', 'Invalid receiver');
    socket.disconnect();
    return;
  }
  socket.join(getRoomName(users[0], users[1]));
}

/**
 * Receives an action from the frontend and adds it to the in-memory queue and Strapi
 * @param pendingActionReq The pending action request
 * @param socket The sender's socket
 */
async function startAction(pendingActionReq: PendingActionRequest, socket: Socket) {
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
      actionId: action.id,
      targetNode: pendingActionReq.nodeId,
      targetEdge: pendingActionReq.edgeId
    }
  });

  // add action to in-memory queue
  console.log('adding action to queue');
  const pendingAction: PendingAction = {
    id: res.id as number,
    user: pendingActionReq.user,
    date: new Date(res.date),
    action: action
  };
  actionQueue.addAction(pendingAction);
}

/**
 * Gets the game state
 * @returns The game state
 */
async function getGameState() {
  const game = await strapi.services['api::game.game'].find();
  return {
    initialized: game.initialized as boolean,
    gameState: game.gameState as GameState,
    endTime: new Date(Date.parse(game.endTime as string))
  };
}

/**
 * Sets the game state
 * @param field The field to set
 * @param value The value to set
 */
function setGameState(field: 'initialized' | 'gameState' | 'endTime' | 'winner', value: any) {
  strapi.services['api::game.game'].createOrUpdate({
    data: {
      [field]: value
    }
  });
}

/**
 * Checks every 5 seconds if the game has ended
 * @returns The interval
 */
function startGameEndChecker(frontend: SocketServer) {
  const interval = setInterval(async () => {
    const game = await getGameState();
    if (game.gameState === GameState.Running && new Date() >= game.endTime) {
      const teams = await strapi.entityService.findMany('api::team.team');
      if (teams.length < 2) {
        console.error('too few teams to end game');
        return;
      }
      if (teams[0].victoryPoints > teams[1].victoryPoints) {
        setGameState('winner', teams[0].id);
      } else if (teams[0].victoryPoints < teams[1].victoryPoints) {
        setGameState('winner', teams[1].id);
      }

      setGameState('gameState', GameState.Ended);
      console.log('game ended');
      frontend.emit('gameEnd');
    }
  }, 5000);
  return interval;
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {
    actionQueue = new ActionQueue();
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ /* strapi */ }) {
    // initialize game if not already initialized
    if (!(await getGameState()).initialized) {
      console.log('Initializing game...');
      setGameState('initialized', true);
      // TODO: initialize actions and set permissions
    }

    // create socket server
    const frontend = new Server(strapi.server.httpServer, {
      cors: {
        origin: [`${FRONTEND_URL}`], //dashboard, can add other origins
        methods: ['GET', 'POST'],
      },
    });

    // start game end checker
    gameEndCheckerInterval = startGameEndChecker(frontend);

    // listen for action complete
    actionQueue.eventEmitter.on('actionComplete', async (actionCompleteRequest: ActionCompleteRequest) =>
      await actionComplete(actionCompleteRequest, frontend));

    frontend.on('connection', async (socket) => {
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

      // listen for messages
      socket.on('message', async (message: Message) => await receiveMessage(message, userId, socket));

      // join room when user connects
      socket.on('join-room', async (users: string[]) => await joinRoom(users, userId, socket));

      // listens for pending actions
      socket.on('startAction', async (pendingActionReq: PendingActionRequest) => await startAction(pendingActionReq, socket));
    });
  },

  /**
   * A function that runs when the application is closing
   * This includes fast reloads
   */
  destroy() {
    actionQueue.stopQueue();
    clearInterval(gameEndCheckerInterval);
  }
};
