import { Socket } from 'socket.io-client';

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export function initSocketListeners(socket: Socket) {
    console.log(`Connecting to Strapi server at ${STRAPI_URL}`);

    socket.on("connect", () => {
        console.log("Connected to Strapi server");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from Strapi server");
    });

    socket.on("message", (message: string) => {
        console.log("Message:", message);
    });
}