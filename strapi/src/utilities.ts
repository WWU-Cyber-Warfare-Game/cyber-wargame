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
    team: res[0].team.name,
    funds: res[0].funds
  };
  return user;
}

/**
 * Gets the ID of a user from their username, or `null` if the user does not exist
 * @param username The username to get the ID of
 */
export async function getUserId(username: string) {
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
  return res[0].id;
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
    successRate: res.action.successRate,
    cost: res.action.cost
  };
  if (user.teamRole !== action.teamRole) {
    console.error('user ' + username + ' attempted to perform action ' + action.name + ' that does not match their team role');
    return null;
  }
  return action;
}

/**
* updates the users funds parameter
* @param userId The id of the target user
* @param actionCost cost of the action requested by the user
*/
export async function updateUserFunds(userId: number, actionCost: number) {
  try {
    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
      fields: ['funds'],
    });

    if (!user) {
      console.error("User not found");
      return false;
    }

    if (user.funds < actionCost) {
      console.error("User has invalid funds");
      return false;
    }

    const newFunds = user.funds - actionCost;

    await strapi.entityService.update('plugin::users-permissions.user', userId, {
      data: {
        funds: newFunds,
      }
    });

    return true;

  } catch (error) {
    console.error("error: " + error);
    return false;
  }
}