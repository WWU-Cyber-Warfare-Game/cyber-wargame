"use client";

import ActionLogFrame from "./ActionLogFrame";
import ActionSelectorFrame from "./ActionSelectorFrame";
import { User } from "@/types";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

interface ActionFrameProps {
    readonly user: User;
    readonly jwt: string;
}

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

/**
 * The action frame for the application. Displays the action selector and the action log.
 * @returns
 */
export default function ActionFrame({ user, jwt }: Readonly<ActionFrameProps>) {
    // const socket = useRef<Socket | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(STRAPI_URL, {
            auth: {
                token: jwt
            }
        });
        setSocket(newSocket);

        // Clean up the socket connection on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, [jwt]);
    
    return (
        <>
            <ActionSelectorFrame user={user} socket={socket} />
            <ActionLogFrame socket={socket} />
        </>
    );
}