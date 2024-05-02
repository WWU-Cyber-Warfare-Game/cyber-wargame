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
}

export interface Message {
    message: string;
    date: Date;
    sender: string;
    receiver: string;
}

export interface Action {
    id: number;
    name: string;
    duration: number;
    description: string;
    teamRole: TeamRole;
    type: ActionType;
    successRate: number;
    targetsNode?: boolean;
    targetsEdge?: boolean;
}

export interface ActionLog {
    action: Action;
    team: string;
    time: Date;
}

export interface PendingActionRequest {
    user: string;
    action: number;
    nodeId?: number;
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