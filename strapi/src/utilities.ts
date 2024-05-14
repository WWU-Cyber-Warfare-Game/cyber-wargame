import { User, TeamRole, Action, ActionType } from "./types";

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

/**
 * Checks if user can perform action and returns the action if they can
 * @param username The user's username
 * @param actionId The ID of the action to check
 * @returns The action if the user can perform it, otherwise `null`
 */
export async function checkAction(username: string, actionId: number) {
    const user = await getUser(username);
    const res = await strapi.entityService.findOne('api::action.action', actionId, {
      populate: '*'
    });
    if (!res) {
      console.error('user ' + username + ' attempted to perform action ' + actionId + ' that does not exist');
      return null;
    }
    const action: Action = {
      id: res.id as number,
      name: res.action.name,
      duration: res.action.duration,
      description: res.action.description,
      teamRole: res.action.teamRole as TeamRole,
      type: res.action.type as ActionType,
      successRate: res.action.successRate
    };
    if (user.teamRole !== action.teamRole) {
      console.error('user ' + username + ' attempted to perform action ' + action.name + ' that does not match their team role');
      return null;
    }
    return action;
  }