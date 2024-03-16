export enum TeamRole {
    Leader = "leader",
    Intelligence = "intelligence",
    Military = "military",
    Diplomat = "diplomat",
    Media = "media"
}

export interface Action {
    name: string;
    duration: number;
    description: string;
    teamRole: TeamRole;
}

export interface PendingAction {
    user: string; // change this to team
    date: Date;
    action: Action;
}

export interface PendingAction {
    user: string; // change this to team
    date: Date;
    id: number;
}