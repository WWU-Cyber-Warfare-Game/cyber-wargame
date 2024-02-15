import { Server } from 'socket.io';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: [`${FRONTEND_URL}/dashboard`], //dashboard, can add other origins
        methods: ['GET', 'POST'],
      },
    });
    io.on('connection', function (socket) {
      console.log('user connected with ID:' + socket.id)
    })
  }
};
