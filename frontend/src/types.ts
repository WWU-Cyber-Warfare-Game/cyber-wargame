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
    targetsNode?: boolean;
    targetsEdge?: boolean;
}

export enum ActionEndState {
    Success = "success",
    Fail = "fail",
    Stopped = "stopped"
}

export interface ActionLog {
    action: Action;
    time: Date;
    endState: ActionEndState;
}

export interface PendingAction {
    user: string;
    action: number;
    nodeId?: number;
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

export interface Modifiers {
    offense: number;
    defense: number;
    buff: number;
}