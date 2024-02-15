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
  async bootstrap({ strapi }) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: [`${FRONTEND_URL}`], //dashboard, can add other origins
        methods: ['GET', 'POST'],
      },
    });
    io.on('connection', (socket) => {
      console.log('user connected with ID:' + socket.id)

      socket.on('message', (message: Message, users: string[]) => {
        console.log(`message received from ${socket.id}`, message);
        socket.to(getRoomName(users[0], users[1])).emit('message', message);
      });

      socket.on('join-room', (users: string[]) => {
        socket.join(getRoomName(users[0], users[1]));
      });
    });
  }
};
