"use client";

import ActionLogFrame from "./ActionLogFrame";
import ActionSelectorFrame from "./ActionSelectorFrame";
import { User, ActionLog, Action, Modifiers, Graph } from "@/types";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { getActionPageData } from "@/actions";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLog, setActionLog] = useState<ActionLog[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [modifiers, setModifiers] = useState<Modifiers>({ offense: 0, defense: 0, buff: 0 });
    const [teamGraph, setTeamGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [opponentGraph, setOpponentGraph] = useState<Graph>({ nodes: [], edges: [] });

    useEffect(() => {
        const newSocket = io(STRAPI_URL, {
            auth: {
                token: jwt
            }
        });
        setSocket(newSocket);

        newSocket.on("actionCompleted", (data) => {
            refreshData();
        });

        newSocket.on("connect_error", (err) => {
            setError("Socket error");
        });

        // Clean up the socket connection on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, [jwt]);

    function refreshData() {
        getActionPageData().then((res) => {
            if (res) {
                setActionLog(res.actionLog);
                setActions(res.actions);
                setModifiers(res.modifiers);
                setTeamGraph(res.teamGraph);
                setOpponentGraph(res.opponentGraph);
            } else {
                setError("Error fetching action page data");
            }
            setLoading(false);
        });
    }

    useEffect(() => {
        refreshData();
    }, []);

    if (!socket || loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <ActionSelectorFrame
                user={user}
                socket={socket}
                modifiers={modifiers}
                actions={actions}
                teamGraph={teamGraph}
                opponentGraph={opponentGraph}
            />
            <ActionLogFrame actionLog={actionLog} />
        </>
    );
}