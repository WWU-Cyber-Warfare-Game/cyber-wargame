"use client";
import { io, Socket } from "socket.io-client";
import { useState, useEffect } from "react";
import { getActionLog } from "@/actions";
import { ActionLog } from "@/types";
import { Action } from "@/types";
import { User } from "@/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function ActionSelectorFrame() {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Establish a connection to the websocket server
        const newSocket = io(STRAPI_URL);
        setSocket(newSocket);

        // Clean up the socket connection on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    function getAction(data: any): Action {
        return {
            name: data.attributes.name,
            duration: data.attributes.duration,
            description: data.attributes.description,
            teamRole: data.attributes.teamRole
        };
    }

    function getUser(data: any): User {
        return {
            username: data.username,
            email: data.email,
            teamRole: data.teamRole,
            team: data.team
        };
    }

    async function clickHandler() {
        try {
            // Fetch action data from your backend API
            const response = await fetch(`${STRAPI_URL}/api/actions?populate=*&`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch action data");
            }
            const actionData = await response.json();
            const action = getAction(actionData);
            const eventName = "sendAction";

            if (socket) {
                socket.emit(eventName, action);
            }
        } catch (error) {
            console.error("Error fetching or sending action data:", error);
        }
    }

    return <button onClick={clickHandler}>Action 1</button>;
}