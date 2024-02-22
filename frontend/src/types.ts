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

export enum ActionRole {
    Authenticated = "authenticated",
    Public = "public",
    TestRole ="test role"

}

export interface ActionLog {
    name: string;
    duration: number;
    description: string;
    role: ActionRole;
}