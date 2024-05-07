export enum TeamRole {
    Leader = "leader",
    Intelligence = "intelligence",
    Military = "military",
    Diplomat = "diplomat",
    Media = "media"
}

export interface User {
    username: string;
    email: string;
    teamRole: TeamRole;
    team: string;
    funds: number
}

export interface Message {
    message: string;
    date: Date;
    sender: string;
    receiver: string;
}

export enum ActionType {
    Offense = "offense",
    Defense = "defense"
}

export interface Action {
    id: number; // NOTE: this is the id or the action entry, not the action component
    name: string;
    duration: number;
    description: string;
    teamRole: TeamRole;
    type: ActionType;
    successRate: number;
    cost: number;
    targets?: {
        target: "node" | "edge";
        myTeam: boolean;
    }
}

export type Target = "team" | "opponent";

export enum ActionEndState {
    Success = "success",
    Fail = "fail",
    Stopped = "stopped"
}

export interface ActionLog {
    name: string;
    description: string;
    teamRole: TeamRole;
    time: Date;
    endState: ActionEndState;
}

export interface PendingAction {
    user: string;
    action: number;
    nodeId?: number;
    edgeId?: number;
}

export interface ActionResponse {
    actions: Action[];
    endTime: Date | null;
}

export interface Node {
    id: string;
    name: string;
    defense: number;
    isCoreNode: boolean;
}

export interface Edge {
    id: string;
    sourceId: string;
    targetId: string;
}

export interface Graph {
    nodes: Node[];
    edges: Edge[];
}

export interface Modifiers {
    offense: number;
    defense: number;
    buff: number;
}