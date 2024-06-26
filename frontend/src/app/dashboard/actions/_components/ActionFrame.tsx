"use client";

import ActionLogFrame from "./ActionLogFrame";
import ActionSelectorFrame from "./ActionSelectorFrame";
import ResourceFrame from "./ActionSelectorFrame/ResourceCount";
import { User, ActionLog, Action, Modifiers, Graph, UserTarget } from "@/types";
import { useContext, useEffect, useState } from "react";
import { getActionPageData } from "@/actions";
import { SocketContext } from "@/components/SocketContext";

interface ActionFrameProps {
    readonly user: User;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

/**
 * The action frame for the application. Displays the action selector and the action log.
 * @returns
 */
export default function ActionFrame({ user }: Readonly<ActionFrameProps>) {
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
    const [users, setUsers] = useState<UserTarget[]>([]);
    const { socket } = useContext(SocketContext);

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
                setUsers(res.users);
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

    useEffect(() => {
        if (socket) socket.on("actionComplete", refreshData);
    }, [socket]);

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
                users={users}
            />
            <ActionLogFrame actionLog={actionLog} />
        </>
    );
}