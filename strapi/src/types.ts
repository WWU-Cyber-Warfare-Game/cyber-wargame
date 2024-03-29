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

export interface Action {
    name: string;
    duration: number;
    description: string;
    teamRole: TeamRole;
}

export interface ActionLog {
    action: Action;
    team: string;
    time: Date;
}

export interface PendingActionRequest {
    user: string;
    action: number;
}

export interface PendingAction {
    user: string;
    date: Date;
    action: Action;
}