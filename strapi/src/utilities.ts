import { User, TeamRole } from "./types";

/**
 * Gets a user's info from their username
 * @param username The user's username
 * @returns The user's info if they exist, otherwise `null`
 */
export async function getUser(username: string) {
    const res = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
            username: username
        },
        populate: '*'
    });
    if (res.length === 0) {
        console.error('user ' + username + ' does not exist');
        return null;
    }
    const user: User = {
        username: res[0].username,
        email: res[0].email,
        teamRole: res[0].teamRole as TeamRole,
        team: res[0].team.name
    };
    return user;
}