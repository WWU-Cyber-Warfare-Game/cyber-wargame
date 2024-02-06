export enum TeamRole {
    Leader = "leader",
    Intelligence = "intelligence",
    Military = "military",
    Diplomat = "diplomat",
    Media = "media"
}

export interface User {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    teamRole: TeamRole;
    team: Team;
}

export interface Team {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
}