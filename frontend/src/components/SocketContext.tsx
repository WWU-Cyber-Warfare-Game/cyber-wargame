"use client";

import { createContext } from "react";
import React, { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export const SocketContext = createContext({
    socket: null as Socket | null,
});

interface SocketProviderProps {
    jwt: string;
    children: React.ReactNode;
}

export function SocketProvider({ jwt, children }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(`${STRAPI_URL}`, {
            auth: {
                token: jwt
            }
        });
        newSocket.on("connect", () => {
            setSocket(newSocket);
        });
        newSocket.on("gameEnd", () => window.location.reload());

        return () => {
            newSocket.disconnect();
        };
    }, [jwt]);

    return (
        <SocketContext.Provider value={{socket: socket}}>
            {children}
        </SocketContext.Provider>
    )
}