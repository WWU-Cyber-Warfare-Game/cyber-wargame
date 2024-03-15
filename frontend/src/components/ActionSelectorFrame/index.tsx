"use client";
import { io, Socket } from "socket.io-client";
import { useState, useEffect, use } from "react";
import { Action, PendingAction, User } from "@/types";
import ActionButton from "@/components/ActionSelectorFrame/ActionButton";
import { getActions, validateUser } from "@/actions";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ActionSelectorFrameProps {
    readonly user: User;
    readonly jwt: string;
}

export default function ActionSelectorFrame({ user, jwt }: Readonly<ActionSelectorFrameProps>) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState<Action[]>([]);
    const [butttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        // Establish a connection to the websocket server
        const newSocket = io(STRAPI_URL, {
            auth: {
                token: jwt
            }
        });
        setSocket(newSocket);

        // Get the list of actions from the server
        getActions().then((res) => {
            if (res) {
                console.log(res);
                const actions = res.actions;
                const performingActions = res.performingActions;
                setActions(actions);
                setLoading(false);
                setButtonDisabled(performingActions);
            } else {
                setLoading(false);
                setError("Error fetching actions");
                setButtonDisabled(true);
            }
        });

        // Clean up the socket connection on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // connection error handling
        if (socket) socket.on('connect_error', () => setError("Error connecting to socket server"));

        // error handling
        if (socket) socket.on('error', (error: string) => setError(error));
    }, [socket]);

    function handleActionClick(action: Action) {
        console.log("Action clicked:", action);
        const pendingAction: PendingAction = {
            user: user.username,
            action: action.id,
        };

        if (socket) {
            socket.emit('startAction', pendingAction);
            setButtonDisabled(true);
        }
    }

    return (
        <div>
            <h3>Perform Action</h3>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {actions.map((action, index) => (
                <ActionButton
                    key={index}
                    action={action}
                    onClick={butttonDisabled ? () => { } : handleActionClick}
                    disabled={butttonDisabled}
                />
            ))}
        </div>
    );
}