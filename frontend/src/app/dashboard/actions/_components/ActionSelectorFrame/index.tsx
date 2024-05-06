"use client";
import { io, Socket } from "socket.io-client";
import { useState, useEffect, useCallback, useContext } from "react";
import { Action, PendingAction, User, Modifiers, Graph } from "@/types";
import ActionButton from "./ActionButton";
import { getGraphData } from "@/actions";
import Timer from "./Timer";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ActionSelectorFrameProps {
    readonly socket: Socket | null;
    readonly user: User;
    readonly modifiers: Modifiers;
    readonly actions: Action[];
    readonly endTime: Date | null;
    readonly setEndTime: (endTime: Date | null) => void;
    readonly teamGraph: Graph;
    readonly opponentGraph: Graph;
    readonly buttonDisabled: boolean;
    readonly setButtonDisabled: (disabled: boolean) => void;
}

export default function ActionSelectorFrame({
    socket,
    user,
    modifiers,
    actions,
    endTime,
    setEndTime,
    teamGraph,
    opponentGraph,
    buttonDisabled,
    setButtonDisabled
}: Readonly<ActionSelectorFrameProps>) {
    function handleActionClick(action: Action, nodeId?: number, edgeId?: number) {
        const pendingAction = {
            user: user.username,
            action: action.id,
            nodeId: nodeId,
            edgeId: edgeId
        };

        if (socket) {
            socket.emit('startAction', pendingAction);
            setButtonDisabled(true);
            setEndTime(new Date(Date.now() + action.duration * 60 * 1000));
        }
    }

    return (
        <div>
            <h3>Perform Action</h3>
            {actions.map((action, index) => (
                <ActionButton
                    key={index}
                    action={action}
                    onClick={handleActionClick}
                    disabled={buttonDisabled}
                    modifiers={modifiers}
                    setButtonDisabled={setButtonDisabled}
                    teamGraph={teamGraph}
                    opponentGraph={opponentGraph}
                />
            ))}
            {endTime && <Timer time={endTime} />}
        </div>
    );
}