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

export interface Action {
    id: number;
    name: string;
    duration: number;
    description: string;
    teamRole: TeamRole;
    type: ActionType;
    successRate: number;
}

export interface PendingAction {
    id: number;
    user: string; // change this to team
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