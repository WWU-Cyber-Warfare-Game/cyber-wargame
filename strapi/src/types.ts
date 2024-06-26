import { Server, Namespace } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export enum TeamRole {
    Leader = "leader",
    Intelligence = "intelligence",
    Military = "military",
    Diplomat = "diplomat",
    Media = "media"
}

export enum ActionType {
    Offense = "offense",
    Defense = "defense"
}

export interface User {
    username: string;
    email: string;
    teamRole: TeamRole;
    team: string;
    funds: number;
}

export interface Message {
    message: string;
    date: Date;
    sender: string;
    receiver: string;
}

export interface Action {
    id: number; // NOTE: this is the id or the action entry, not the action component
    name: string;
    duration: number;
    description: string;
    teamRole: TeamRole;
    type: ActionType;
    successRate: number;
    targets?: {
        target: "node" | "edge" | "player";
        myTeam: boolean;
    }
    cost: number;
}

export type Target = "team" | "opponent";

export interface ActionLog {
    action: Action;
    team: string;
    time: Date;
}

export interface PendingActionRequest {
    user: string;
    action: number;
    nodeId?: number;
    edgeId?: number;
    userId?: number;
}

export interface PendingAction {
    id: number;
    user: string;
    date: Date;
    action: Action;
    nodeId?: number;
}

export enum ActionEndState {
    Success = "success",
    Fail = "fail",
    Stopped = "stopped"
}

export interface ActionCompleteRequest {
    pendingActionId: number;
}

export enum GameState {
    NotStarted = "notstarted",
    Running = "running",
    Ended = "ended"
}

export type SocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
