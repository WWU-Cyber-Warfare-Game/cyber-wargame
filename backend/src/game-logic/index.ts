import { io } from "socket.io-client";

export const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

const socket = io(`${STRAPI_URL}/game-logic`);

socket.on("connect", () => {
    console.log("Connected to strapi server");
});

socket.on("message", (message: string) => {
    console.log(message);
});