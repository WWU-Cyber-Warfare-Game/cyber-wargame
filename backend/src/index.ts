import { Server } from 'socket.io';
import { spawn } from 'node:child_process';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface Message {
  message: string;
  date: Date;
  sender: string;
  receiver: string;
}

// returns the user room string
// room string is both usernames in alphabetical order, separated by an ampersand
// e.g. 'user1&user2'
function getRoomName(sender: string, receiver: string) {
  return [sender, receiver].sort().join('&');
}

// checks the user's token
// returns the user's ID if the token is valid, otherwise returns null
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

// checks if the receiver is valid (i.e. exists and is on the same team as the sender)
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

    // game logic process socket
    // TODO: probably not secure, make sure this is not accessible from outside localhost (use a secret key maybe?)
    const gameLogicSocket = io.of('/game-logic');
    gameLogicSocket.on('connection', () => {
      console.log('game-logic connected');
    });

    // start game-logic process
    const gameLogic = spawn('node', ['dist/src/game-logic/index.js']); // is working directory different in production?
    gameLogic.stdout.on('data', (data) => {
      console.log(`[game-logic] ${data}`);
    });
    gameLogic.stderr.on('data', (data) => {
      console.error(`[game-logic]: ${data}`);
    });

    io.on('connection', async (socket) => {
      // check user jwt
      const userId = await checkToken(socket.handshake.auth.token);
      if (!socket.handshake.auth.token || !userId) {
        console.error('user connected without valid token, disconnecting...');
        socket.emit('error', 'Invalid token');
        socket.disconnect();
        return;
      }
      
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
        gameLogicSocket.emit('message', message.message);
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
    });
  }
};
