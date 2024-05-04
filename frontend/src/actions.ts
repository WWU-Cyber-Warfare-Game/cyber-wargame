"use server";

import { z } from "zod";
import { emailRegex, usernameRegex, passwordRegex } from "./regex";
import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Message, Action, ActionLog, ActionResponse, Modifiers, TeamRole, Node, Edge, Target, Graph } from "./types";
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
        })
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
 * Gets all the actions that have been performed.
 * @returns An array of ActionLog objects, or null if there is an error
 */
export async function getActionLog() {
    function parseActionLog(data: any): ActionLog {
        return {
            name: data.attributes.action.name,
            description: data.attributes.action.description,
            teamRole: data.attributes.action.teamRole,
            time: new Date(Date.parse(data.attributes.date)),
            endState: data.attributes.endState
        }
    }

    const user = await validateUser();
    if (!user) {
        console.error("User not validated.");
        return null;
    }
    try {
        // creates a query that gets the last 100 resolved actions for the current user
        const query = qs.stringify({
            pagination: {
                limit: 100
            },
            sort: "date:desc",
            populate: "*",
            filters: {
                user: user.username
            }
        });
        // NOTE: right now this only fetches the resolved actions for the current user, not the whole team
        const res = await fetch(`${STRAPI_URL}/api/resolved-actions?${query}`, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            return data.data.map((action: any) => parseActionLog(action));
        } else {
            console.error('Failed to fetch action log:', res.status, res.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching action log:', error);
        return null;
    }
}

/**
 * Gets all the actions that can be performed.
 * @returns An array of Action objects, or null if there is an error
 */
export async function getActions() {
    function parseAction(data: any): Action {
        return {
            id: data.id,
            name: data.attributes.action.name,
            duration: data.attributes.action.duration,
            description: data.attributes.action.description,
            teamRole: data.attributes.action.teamRole,
            type: data.attributes.action.type,
            successRate: data.attributes.action.successRate,
            targetsNode: data.attributes.action.targetsNode && data.attributes.action.targetsNode,
            targetsEdge: data.attributes.action.targetsEdge && data.attributes.action.targetsEdge
        };
    }

    const user = await validateUser();
    if (!user) {
        console.error("User not validated.");
        return null;
    }

    try {
        const actionsRes = await fetch(`${STRAPI_URL}/api/actions?populate=*&filters[action][teamRole][$eq]=${user.teamRole}`, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`
            }
        });

        const currentActionRes = await fetch(`${STRAPI_URL}/api/pending-actions?filters[user][$eq]=${user.username}`, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`
            }
        });

        if (actionsRes.ok && currentActionRes.ok) {
            const actions = await actionsRes.json();
            const currentAction = await currentActionRes.json();

            let endTime: Date | null = null;
            if (currentAction.data.length > 0) {
                endTime = new Date(Date.parse(currentAction.data[0].attributes.date));
            }

            return {
                actions: actions.data.map((action: any) => parseAction(action)),
                endTime: endTime
            } as ActionResponse;
        } else {
            const errorRes = actionsRes.ok ? currentActionRes : actionsRes;
            console.error('Failed to fetch actions:', errorRes.status, errorRes.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching actions:', error);
        return null;
    }
}

/**
 * Gets the graph data for the network graph
 * @param target The target of the action (team or opponent)
 * @returns An object containing the nodes and edges, or null if there is an error
 */
export async function getGraphData(target: Target) {
    function parseNodes(data: any) {
        let nodes: Node[] = [];
        data.forEach(function (n: any) {
            const newNode: Node = {
                id: n.id.toString(),
                name: n.attributes.name,
                defense: n.attributes.defense,
                isCoreNode: n.attributes.isCoreNode
            }
            nodes.push(newNode);
        });
        return nodes;
    }

    function parseEdges(data: any) {
        let edges: Edge[] = [];
        data.forEach(function (e: any) {
            const newEdge: Edge = {
                id: e.id.toString(),
                sourceId: e.attributes.source.data.id.toString(),
                targetId: e.attributes.target.data.id.toString()
            }
            edges.push(newEdge);
        });
        return edges;
    }

    try {
        const user = await validateUser();
        if (!user) {
            console.error("User not validated.");
            return null;
        }

        // fetch nodes
        let fetchedNodes;
        if (target === "opponent") {
            fetchedNodes = await fetch(`${STRAPI_URL}/api/nodes?filters[team][name][$ne]=${user.team}&filters[visible][$eq]=true&populate=*`, {
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`
                }
            });
        } else {
            fetchedNodes = await fetch(`${STRAPI_URL}/api/nodes?filters[team][name][$eq]=${user.team}&populate=*`, {
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`
                }
            });
        }
        const unparsedNodes = await fetchedNodes.json();
        const parsedNodes = parseNodes(unparsedNodes.data);

        // fetch edges
        const fetchedEdges = await fetch(`${STRAPI_URL}/api/edges?populate=*`, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        const unparsedEdges = await fetchedEdges.json();
        const parsedEdges = parseEdges(unparsedEdges.data)
            .filter((edge) => parsedNodes.map((node) => node.id).includes(edge.sourceId) && parsedNodes.map((node) => node.id).includes(edge.targetId));

        // return object with nodes and edges
        const graph: Graph = {
            nodes: parsedNodes,
            edges: parsedEdges
        };
        return graph;
    } catch (error) {
        console.error('Error fetching nodes:', error);
        return null;
    }
}

/**
 * Gets the current modifiers that the user has.
 * @returns the modifiers, or `null` if there is an error
 */
export async function getModifiers() {
    const user = await validateUser();
    if (!user) {
        console.error("User not validated.");
        return null;
    }
    try {
        const res = await fetch(`${STRAPI_URL}/api/teams?filters[name][$eq]=${user.team}&populate=*`, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            let modifiers: Modifiers;
            switch (user.teamRole) {
                case TeamRole.Leader:
                    modifiers = {
                        offense: data.data[0].attributes.leaderModifiers.offense,
                        defense: data.data[0].attributes.leaderModifiers.defense,
                        buff: data.data[0].attributes.leaderModifiers.buff
                    };
                    break;
                case TeamRole.Intelligence:
                    modifiers = {
                        offense: data.data[0].attributes.intelligenceModifiers.offense,
                        defense: data.data[0].attributes.intelligenceModifiers.defense,
                        buff: data.data[0].attributes.intelligenceModifiers.buff
                    };
                    break;
                case TeamRole.Military:
                    modifiers = {
                        offense: data.data[0].attributes.militaryModifiers.offense,
                        defense: data.data[0].attributes.militaryModifiers.defense,
                        buff: data.data[0].attributes.militaryModifiers.buff
                    };
                    break;
                case TeamRole.Diplomat:
                    modifiers = {
                        offense: data.data[0].attributes.diplomatModifiers.offense,
                        defense: data.data[0].attributes.diplomatModifiers.defense,
                        buff: data.data[0].attributes.diplomatModifiers.buff
                    };
                    break;
                case TeamRole.Media:
                    modifiers = {
                        offense: data.data[0].attributes.mediaModifiers.offense,
                        defense: data.data[0].attributes.mediaModifiers.defense,
                        buff: data.data[0].attributes.mediaModifiers.buff
                    };
                    break;
            }
            return modifiers;
        } else {
            console.error('Failed to fetch buff:', res.status, res.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching buff:', error);
        return null;
    }
}