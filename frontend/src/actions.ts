"use server";

import { z } from "zod";
import { emailRegex, usernameRegex, passwordRegex } from "./regex";
import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Message, Action, ActionLog, ActionResponse, Modifiers, TeamRole, Node, Edge, Target, Graph, PendingAction, GameState } from "./types";
import qs from "qs";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Sends a GraphQL query to the Strapi API.
 * @param query The GraphQL query to send to the Strapi API
 * @returns A response from the Strapi API
 */
async function sendGraphQLQuery(query: string) {
  return await fetch(`${STRAPI_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_API_TOKEN}`
    },
    body: JSON.stringify({
      query: query
    }),
    cache: "no-cache"
  });
}

/**
 * Parses the user data retreived from Strapi.
 * @param data The data retreived from the Strapi API
 * @returns The parsed user data
 */
function parseUser(user: any) {
  let team;
  if (!user.attributes.team) team = null;
  else team = user.attributes.team.data.attributes.name;
  const ret: User = {
    username: user.attributes.username,
    email: user.attributes.email,
    teamRole: user.attributes.teamRole,
    team: team
  };
  return ret;
}

/**
 * Takes information from a form and sends it to the Strapi API to log in, then sets the JWT cookie.
 * @param prevState Return value from the previous call to this function
 * @param formData Data from the login form
 * @returns null if there is no error, or an error message
 */
export async function logIn(prevState: string | null, formData: FormData) {
  const formSchema = z.object({
    identifier: z.string(),
    password: z.string()
  });

  const validataedFormData = formSchema.safeParse({
    identifier: formData.get("email"),
    password: formData.get("password")
  });

  if (!validataedFormData.success) return "Server-side validation failed";

  try {
    const res = await axios.post(`${STRAPI_URL}/api/auth/local`, validataedFormData.data);
    if (res.data.jwt) {
      cookies().set("jwt", res.data.jwt);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error.message;
    } else if (isAxiosError(error) && error.message) {
      return error.message;
    } else if (isAxiosError(error) && error.code == "ECONNREFUSED") {
      return "Connection refused. Is the Strapi server running?";
    } else {
      return "An unknown error occurred";
    }
  }
  redirect("/dashboard");
}

/**
 * Takes information from a form and sends it to the Strapi API to sign up, then sets the jwt cookie.
 * @param prevState Return value from the previous call to this function
 * @param formData Data from the signup form
 * @returns null if there is no error, or an error message
 */
export async function signUp(prevState: string | null, formData: FormData) {
  const formSchema = z.object({
    email: z.string().regex(emailRegex),
    username: z.string().regex(usernameRegex),
    password: z.string().regex(passwordRegex),
  });

  const validataedFormData = formSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validataedFormData.success) return "Server-side validation failed";
  if (validataedFormData.data.password !== formData.get("confirmPassword")) return "Passwords do not match";

  try {
    const res = await axios.post(`${STRAPI_URL}/api/auth/local/register`, validataedFormData.data);
    if (res.data.jwt) {
      cookies().set("jwt", res.data.jwt);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data.error.message;
    } else if (isAxiosError(error) && error.message) {
      return error.message;
    } else if (isAxiosError(error) && error.code == "ECONNREFUSED") {
      return "Connection refused. Is the Strapi server running?";
    } else {
      return "An unknown error occurred";
    }
  }
  redirect("/dashboard");
}

/**
 * Logs the user out by deleting the JWT cookie, then redirects back to the home page.
 */
export async function logOut() {
  cookies().delete("jwt");
  redirect("/");
}

/**
 * Sends the user's jwt to the Strapi API to validate it.
 * @returns A User object if the user is validated, or null if they are not.
 */
export async function validateUser() {
  try {
    let jwt = cookies().get("jwt")?.value;
    if (!jwt) return null;

    const res = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    if (res.ok) {
      const unparsedData = await res.json();
      const ret: User = {
        username: unparsedData.username,
        email: unparsedData.email,
        teamRole: unparsedData.teamRole,
        team: unparsedData.team ? unparsedData.team.name : null
      };
      return ret;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Gets all the users in a specific team.
 * @param team The name of the team
 * @returns An array of User objects
 */
export async function getTeamUsers(team: string) {
  try {
    const res = await sendGraphQLQuery(`
        {
            usersPermissionsUsers(filters: {
              team: {
                name: {
                  eq: "${team}"
                }
              }
            }, sort: "username:asc") {
              data {
                attributes {
                  username
                  email
                  teamRole
                  team {
                    data {
                      attributes {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `);

    if (res.ok) {
      const data = await res.json();
      const parsedData: User[] = data.data.usersPermissionsUsers.data.map((user: any) => parseUser(user));
      return parsedData;
    } else {
      console.error(res);
      return [] as User[];
    }
  } catch (error) {
    console.error(error);
    return [] as User[];
  }
}

/**
 * Gets a specific user by their username.
 * @param username The username of the user
 * @returns A User object if the user exists, or null if they do not.
 */
export async function getUser(username: string) {
  try {
    const res = await sendGraphQLQuery(`
        {
            usersPermissionsUsers(filters: {
              username: {
                eq: "${username}"
              }
            }) {
              data {
                attributes {
                  username
                  email
                  teamRole
                  team {
                    data {
                      attributes {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `);

    if (res.ok) {
      const unparsedData = await res.json();
      const user = unparsedData[0];
      if (!user) return null;
      return parseUser(user);
    }
    console.error(res);
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Gets all the messages between the current user and another user.
 * @param username The username of the other user
 * @returns An array of Message objects, or null if there is an error
 */
export async function getMessages(username: string) {
  const user = await validateUser();
  if (!user) {
    console.error("User not validated.");
    return null;
  }

  const res = await sendGraphQLQuery(`
    {
        messages(
          pagination: {
              limit: 100
          },
          sort: "date:desc",
          filters: {
            or: [
              {
                sender: {
                  eq: "${user.username}"
                },
                receiver: {
                  eq: "${username}"
                }
              },
              {
                sender: {
                  eq: "${username}"
                },
                receiver: {
                  eq: "${user.username}"
                }
              }
            ]
          }
        ) {
          data {
            attributes {
              message
              date
              sender
              receiver
            }
          }
        }
      }
    `);

  if (!res.ok) {
    console.error(res);
    return null;
  }
  const data = await res.json();
  const parsedData: Message[] = data.data.messages.data
    .map((message: any) => {
      const ret: Message = {
        message: message.attributes.message,
        date: new Date(Date.parse(message.attributes.date)),
        sender: message.attributes.sender,
        receiver: message.attributes.receiver
      };
      return ret;
    });
  return parsedData.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Parses the graph data for the network graph.
 * @param nodesData All of the nodes
 * @param edgesData All of the edges
 * @param user The current user
 * @returns The two graphs
 */
function parseGraphData(nodesData: any[], edgesData: any[], user: User) {
  const nodes = nodesData
    .filter((node: any) => {
      if (node.attributes.team.data.attributes.name === user.team) return true;
      else if (node.attributes.team.data.attributes.name !== user.team && node.attributes.visible) return true;
      return false;
    })
    .map((unParsedNode: any) => {
      const node: Node = {
        id: unParsedNode.id,
        name: unParsedNode.attributes.name,
        defense: unParsedNode.attributes.defense,
        isCoreNode: unParsedNode.attributes.isCoreNode,
      };
      return {
        node: node,
        isTeam: unParsedNode.attributes.team.data.attributes.name === user.team
      };
    });

  const edges: Edge[] = edgesData
    .map((edge: any) => {
      const ret: Edge = {
        id: edge.id,
        sourceId: edge.attributes.source.data.id,
        targetId: edge.attributes.target.data.id,
      };
      return ret;
    })
    .filter((edge) =>
      nodes.map((node) => node.node.id)
        .includes(edge.sourceId)
      && nodes.map((node) => node.node.id).includes(edge.targetId)
    );

  const teamNodes = nodes.filter((node) => node.isTeam).map((node) => node.node);
  const opponentNodes = nodes.filter((node) => !node.isTeam).map((node) => node.node);
  const teamEdges = edges.filter((edge) => teamNodes.map((node) => node.id).includes(edge.sourceId) && teamNodes.map((node) => node.id).includes(edge.targetId));
  const opponentEdges = edges.filter((edge) => opponentNodes.map((node) => node.id).includes(edge.sourceId) && opponentNodes.map((node) => node.id).includes(edge.targetId));
  const teamGraph: Graph = {
    nodes: teamNodes,
    edges: teamEdges
  };
  const opponentGraph: Graph = {
    nodes: opponentNodes,
    edges: opponentEdges
  };

  return {
    teamGraph: teamGraph,
    opponentGraph: opponentGraph
  };
}

/**
 * Fetches all of the data needed for the action page.
 * @returns Action log, actions, modifiers, and the two graphs; or `null` if there is an error
 */
export async function getActionPageData() {
  const user = await validateUser();
  if (!user) {
    console.error("User not validated.");
    return null;
  }
  const res = await sendGraphQLQuery(`
    query(
      $user: String = "${user.username}"
      $team: String = "${user.team}"
      $teamRole: String = "${user.teamRole}"
    ) {
      actionLog: resolvedActions(
        pagination: { limit: 100 }
        sort: "date:desc"
        filters: { user: { eq: $user } }
      ) {
        data {
          attributes {
            action {
              name
              description
              teamRole
            }
            date
            endState
          }
        }
      }
    
      actions(filters: { action: { teamRole: { eq: $teamRole } } }) {
        data {
          id
          attributes {
            action {
              name
              duration
              description
              teamRole
              type
              successRate
              targets {
                target
                myTeam
              }
            }
          }
        }
      }
    
      pendingActions(filters: { user: { eq: $user } }) {
        data {
          attributes {
            date
          }
        }
      }
    
      modifiers: teams(filters: { name: { eq: $team } }) {
        data {
          attributes {
            ${user.teamRole}Modifiers {
              offense
              defense
              buff
            }
          }
        }
      }
    
      nodes(filters: {}) {
        data {
          id
          attributes {
            name
            team {
              data {
                attributes {
                  name
                }
              }
            }
            defense
            isCoreNode
            visible
          }
        }
      }
    
      edges(filters: {}) {
        data {
          id
          attributes {
            source {
              data {
                id
              }
            }
            target {
              data {
                id
              }
            }
            defense
          }
        }
      }
    }    
    `);
  const data = await res.json();
  const actionLogData: any[] = data.data.actionLog.data;
  const actionsData: any[] = data.data.actions.data;
  const pendingActionsData: any[] = data.data.pendingActions.data;
  const modifiersData: any[] = data.data.modifiers.data;
  const nodesData: any[] = data.data.nodes.data;
  const edgesData: any[] = data.data.edges.data;

  // parse action log
  const actionLog: ActionLog[] = actionLogData.map((action: any) => {
    const ret: ActionLog = {
      name: action.attributes.action.name,
      description: action.attributes.action.description,
      teamRole: action.attributes.action.teamRole,
      time: new Date(Date.parse(action.attributes.date)),
      endState: action.attributes.endState
    }
    return ret;
  });

  // parse actions
  const actions: Action[] = actionsData.map((action: any) => {
    const ret: Action = {
      id: action.id,
      name: action.attributes.action.name,
      duration: action.attributes.action.duration,
      description: action.attributes.action.description,
      teamRole: action.attributes.action.teamRole,
      type: action.attributes.action.type,
      successRate: action.attributes.action.successRate,
      targets: action.attributes.action.targets
    };
    return ret;
  });

  // get end time
  const endTime = pendingActionsData.length > 0 ? new Date(Date.parse(pendingActionsData[0].attributes.date)) : null;

  // parse modifiers
  const modifiers: Modifiers = {
    offense: modifiersData[0].attributes[`${user.teamRole}Modifiers`].offense,
    defense: modifiersData[0].attributes[`${user.teamRole}Modifiers`].defense,
    buff: modifiersData[0].attributes[`${user.teamRole}Modifiers`].buff
  };

  // parse graph
  const { teamGraph, opponentGraph } = parseGraphData(nodesData, edgesData, user);

  return {
    actionLog: actionLog,
    actions: actions,
    endTime: endTime,
    modifiers: modifiers,
    teamGraph: teamGraph,
    opponentGraph: opponentGraph,
  };
}

/**
 * Gets the team and opponent graphs for the network graph.
 * @returns The team and opponent graphs, or `null` if there is an error
 */
export async function getGraphData() {
  const user = await validateUser();
  if (!user) {
    console.error("User not validated.");
    return null;
  }
  const res = await sendGraphQLQuery(`
    {
        nodes(filters: {}) {
          data {
            id
            attributes {
              name
              team {
                data {
                  attributes {
                    name
                  }
                }
              }
              defense
              isCoreNode
              visible
            }
          }
        }
      
        edges(filters: {}) {
          data {
            id
            attributes {
              source {
                data {
                  id
                }
              }
              target {
                data {
                  id
                }
              }
              defense
            }
          }
        }
      }
    `);
  const data = await res.json();
  const nodesData: any[] = data.data.nodes.data;
  const edgesData: any[] = data.data.edges.data;
  const { teamGraph, opponentGraph } = parseGraphData(nodesData, edgesData, user);
  return {
    teamGraph: teamGraph,
    opponentGraph: opponentGraph
  };
}

/**
 * Gets the current game state.
 * @returns The current game state
 */
export async function getGameState() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/game?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`
      },
      cache: "no-cache"
    });
    if (!res.ok) {
      console.error(res);
      return null;
    }
    const data = await res.json();
    return {
      gameState: data.data.attributes.gameState as GameState,
      endTime: data.data.attributes.endTime ? new Date(Date.parse(data.data.attributes.endTime)) : null,
      winner: data.data.attributes.winner.data ? data.data.attributes.winner.data.attributes.name : null
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}