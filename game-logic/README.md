# Game Logic Process

This process runs most of the game logic. It connects to the Strapi process and communicates through a socket.

- `npm run dev`: Starts the process and auto rebuilds and reloads when a code change is detected.
- `npm run start`: Starts the process normally.
  - Note: This does not build the files before running and does not auto reload.
- `npm run build`: Builds the code and copies the output into the `dist` directory.
