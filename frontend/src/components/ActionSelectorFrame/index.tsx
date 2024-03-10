"use client";
import { io, Socket } from "socket.io-client";
import { useState, useEffect } from "react";
import { Action } from "@/types";
import ActionButton from "@/components/ActionSelectorFrame/ActionButton";
import { getActions } from "@/actions";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function ActionSelectorFrame() {
    // TODO: better error handling
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState<Action[]>([]);

    useEffect(() => {
        // Establish a connection to the websocket server
        const newSocket = io(STRAPI_URL);
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

    return (
        <div>
            <h3>Actions</h3>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {actions.map((action, index) => (
                <ActionButton key={index} action={action} />
            ))}
        </div>
    );
}