import { io } from "socket.io-client";
import { initSocketListeners } from "./socket";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

const socket = io(`${STRAPI_URL}/game-logic`);

console.log("Game logic process started!");
initSocketListeners(socket);