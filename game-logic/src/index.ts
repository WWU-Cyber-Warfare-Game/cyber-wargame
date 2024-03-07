import { io } from "socket.io-client";

export const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

const socket = io(`${STRAPI_URL}/game-logic`);

console.log("Game logic process started!");
console.log(`Connecting to Strapi server at ${STRAPI_URL}`);

socket.on("connect", () => {
    console.log("Connected to Strapi server");
});

socket.on("message", (message: string) => {
    console.log(message);
});