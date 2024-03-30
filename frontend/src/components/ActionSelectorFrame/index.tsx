"use client";
import { io, Socket } from "socket.io-client";
import { useState, useEffect, use } from "react";
import { Action, PendingAction, User } from "@/types";
import ActionButton from "@/components/ActionSelectorFrame/ActionButton";
import { getActions, validateUser } from "@/actions";
import Timer from "@/components/Timer";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ActionSelectorFrameProps {
    readonly socket: Socket | null;
    readonly user: User;
}

export default function ActionSelectorFrame({ socket, user }: Readonly<ActionSelectorFrameProps>) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState<Action[]>([]);
    const [butttonDisabled, setButtonDisabled] = useState(false);
    const [endTime, setEndTime] = useState<Date | null>(null);

    function refreshActions() {
        // Get the list of actions from the server
        getActions().then((res) => {
            setLoading(false);
            setEndTime(null);

            if (res) {
                setActions(res.actions);
                setButtonDisabled(res.endTime !== null);
                if (res.endTime) setEndTime(new Date(res.endTime));
            } else {
                setError("Error fetching actions");
                setButtonDisabled(true);
            }
        });
    }

    useEffect(() => {
        refreshActions();
    }, []);

    useEffect(() => {
        // re-enable buttons when action is complete
        if (socket) socket.on('actionComplete', () => refreshActions());

        // connection error handling
        if (socket) socket.on('connect_error', () => setError("Error connecting to socket server"));

        // error handling
        if (socket) socket.on('error', (error: string) => setError(error));
    }, [socket]);

    function handleActionClick(action: Action) {
        const pendingAction: PendingAction = {
            user: user.username,
            action: action.id,
        };

        if (socket) {
            socket.emit('startAction', pendingAction);
            setButtonDisabled(true);
        }

        setEndTime(new Date(Date.now() + action.duration * 60 * 1000));
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
            {endTime && <Timer time={endTime} />}
        </div>
    );
}