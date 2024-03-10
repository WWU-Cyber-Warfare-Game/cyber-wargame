"use client";
import { io, Socket } from "socket.io-client";
import { useState, useEffect } from "react";
import { Action, PendingAction, User } from "@/types";
import ActionButton from "@/components/ActionSelectorFrame/ActionButton";
import { getActions, validateUser } from "@/actions";
import { useRouter } from "next/router";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ActionSelectorFrameProps {
    readonly user: User;
    readonly jwt: string;
}

export function ActionSelectorFrame({ user, jwt }: Readonly<ActionSelectorFrameProps>) {
    // TODO: better error handling
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState<Action[]>([]);

    useEffect(() => {
        // Establish a connection to the websocket server
        const newSocket = io(STRAPI_URL, {
            auth: {
                token: jwt
            }
        });
        setSocket(newSocket);

        // Get the list of actions from the server
        getActions().then((actions) => {
            if (actions) {
                setActions(actions);
                setLoading(false);
            } else {
                setError("Error fetching actions");
            }
        });

        // Clean up the socket connection on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    function handleActionClick(action: Action) {
        console.log("Action clicked:", action);
        const pendingAction: PendingAction = {
            user: user.username,
            date: new Date(),
            action: action,
        };

        if (socket) {
            console.log("Emitting action:", pendingAction);
            socket.emit('startAction', pendingAction, (response: string) => {
                console.log("Server response:", response);
            });
        }
    }

    return (
        <div>
            <h3>Actions</h3>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {actions.map((action, index) => (
                <ActionButton key={index} action={action} onClick={handleActionClick} />
            ))}
        </div>
    );
}