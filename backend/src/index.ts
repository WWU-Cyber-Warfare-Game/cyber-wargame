import { Server } from 'socket.io';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface Message {
  message: string;
  date: Date;
  sender: string;
  receiver: string;
}

function getRoomName(sender: string, receiver: string) {
  return [sender, receiver].sort().join('&');
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

    // TODO: add authentication
    io.of('/socket/chat').on('connection', (socket) => { // TODO: figure out why like 10 users connect at once
      console.log('user connected with ID:' + socket.id);

      // listen for messages, add to strapi, and emit to room
      socket.on('message', async (message: Message) => {
        socket.to(getRoomName(message.sender, message.receiver)).emit('message', message);
        await strapi.entityService.create('api::message.message', {
          data: {
            message: message.message,
            date: message.date,
            sender: message.sender,
            receiver: message.receiver,
          }
        });
      });

      // join room when user connects
      socket.on('join-room', (users: string[]) => {
        socket.join(getRoomName(users[0], users[1]));
      });
    });
  }
};
