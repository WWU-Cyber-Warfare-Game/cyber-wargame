"use client";
import { Socket } from "socket.io-client";
import { Action, PendingAction, User, Modifiers, Graph, UserTarget } from "@/types";
import ActionButton from "./ActionButton";
import Timer from "@/components/Timer";
import styles from "./ActionSelectorFrame.module.css";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

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
    readonly setUserFunds: (funds: number) => void;
    readonly userFunds: number;
    readonly users: UserTarget[];
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
    setButtonDisabled,
    setUserFunds,
    userFunds,
    users
}: Readonly<ActionSelectorFrameProps>) {
    function handleActionClick(action: Action, nodeId?: number, edgeId?: number, userId?: number) {
        const pendingAction: PendingAction = {
            user: user.username,
            action: action.id,
            nodeId: nodeId,
            edgeId: edgeId,
            userId: userId
        };

        if (socket) {
            socket.emit('startAction', pendingAction);
            setButtonDisabled(true);
            setEndTime(new Date(Date.now() + action.duration * 60 * 1000));
        }
    }

    return (
        <div className={styles.buttonCollection}>
            <h3 style={{display: "flex", flexDirection: "column", textAlign: "center", justifyContent: "center"}}>Perform Action</h3>
            {actions.map((action, index) => (
                <ActionButton
                    key={index}
                    action={action}
                    onClick={handleActionClick}
                    disabled={buttonDisabled}
                    modifiers={modifiers}
                    userFunds={userFunds}
                    setUserFunds={setUserFunds}
                    setButtonDisabled={setButtonDisabled}
                    teamGraph={teamGraph}
                    opponentGraph={opponentGraph}
                    users={users}
                />
            ))}
            {endTime && <Timer time={endTime} />}
        </div>
    );
}