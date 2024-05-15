"use client";

import ActionLogFrame from "./ActionLogFrame";
import ActionSelectorFrame from "./ActionSelectorFrame";
import ResourceFrame from "./ActionSelectorFrame/ResourceCount";
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
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [modifiers, setModifiers] = useState<Modifiers>({ offense: 0, defense: 0, buff: 0 });
    const [teamGraph, setTeamGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [opponentGraph, setOpponentGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [userFunds, setUserFunds] = useState(user.funds);

    useEffect(() => {
        const newSocket = io(STRAPI_URL, {
            auth: {
                token: jwt
            }
        });
        setSocket(newSocket);

        newSocket.on("actionComplete", (data) => {
            refreshData();
            setButtonDisabled(false);
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
                setEndTime(res.endTime);
                setModifiers(res.modifiers);
                setTeamGraph(res.teamGraph);
                setOpponentGraph(res.opponentGraph);
                setUserFunds(res.userFunds);
                if (!res.endTime) setButtonDisabled(false);
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
            <ResourceFrame funds={userFunds}></ResourceFrame>
            <ActionSelectorFrame
                user={user}
                socket={socket}
                modifiers={modifiers}
                actions={actions}
                endTime={endTime}
                setEndTime={setEndTime}
                teamGraph={teamGraph}
                opponentGraph={opponentGraph}
                buttonDisabled={buttonDisabled}
                setButtonDisabled={setButtonDisabled}
                setUserFunds={setUserFunds}
                userFunds={userFunds}
            />
            <ActionLogFrame actionLog={actionLog} />
        </>
    );
}