"use server";

import { z } from "zod";
import { emailRegex, usernameRegex, passwordRegex } from "./regex";
import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Message, Action, ActionLog, ActionResponse, Modifiers, TeamRole, Node, Edge, Target } from "./types";
import qs from "qs";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Parses the user data retreived from Strapi.
 * @param data The data retreived from the Strapi API
 * @returns The parsed user data
 */
function parseUser(data: any): User {
    let team;
    if (!data.team) team = null;
    else team = data.team.name;

    return {
        username: data.username,
        email: data.email,
        teamRole: data.teamRole,
        team: team
    };
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
            return parseUser(unparsedData);
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
    const res = await fetch(`${STRAPI_URL}/api/users?populate=*&filters[team][name][$eq]=${team}`, {
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`
        }
    });

    if (res.ok) {
        const unparsedData = await res.json();
        return unparsedData.map((user: any) => parseUser(user));
    }
    console.error(res);
    return [] as User[];
}

/**
 * Gets a specific user by their username.
 * @param username The username of the user
 * @returns A User object if the user exists, or null if they do not.
 */
export async function getUser(username: string) {
    const res = await fetch(`${STRAPI_URL}/api/users?populate=*&filters[username][$eq]=${username}`, {
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`
        }
    });

    if (res.ok) {
        const unparsedData = await res.json();
        const user = unparsedData[0];
        if (!user) return null;
        return parseUser(user);
    }
    console.error(res);
    return null;
}

/**
 * Gets all the messages between the current user and another user.
 * @param username The username of the other user
 * @returns An array of Message objects, or null if there is an error
 */
export async function getMessages(username: string) {

    // parses the data retreived from the Strapi API and returns an array of Message objects
    function parseResponseData(data: any) {
        let messages: Message[] = [];
        data.forEach(function (m: any) {
            const newMessage: Message = {
                message: m.attributes.message,
                date: new Date(Date.parse(m.attributes.date)),
                sender: m.attributes.sender,
                receiver: m.attributes.receiver
            }
            messages.push(newMessage);
        });
        return messages;
    }

    const user = await validateUser();
    if (!user) {
        console.error("User not validated.");
        return null;
    }

    // creates a query that get the last 100 messages between the current user and the other user
    const query = qs.stringify({
        pagination: {
            limit: 100
        },
        sort: "date:desc",
        populate: "*",
        filters: {
            $or: [
                {
                    sender: user.username,
                    receiver: username
                },
                {
                    sender: username,
                    receiver: user.username
                }
            ]
        }
    });

    const res = await fetch(`${STRAPI_URL}/api/messages?${query}`, {
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`
        }
    });

    if (!res.ok) {
        console.error(res);
        return null;
    }
    const data = await res.json();
    return parseResponseData(data.data).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Gets all the actions that have been performed.
 * @returns An array of ActionLog objects, or null if there is an error
 */
export async function getActionLog() {
    function parseActionLog(data: any): ActionLog {
        return {
            action: data.attributes.action,
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
 * Gets all the nodes of the network graph
 * @returns An array of nodes, or null if there is an error
 */
export async function getNodes(target: Target) {
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

    try {
        // Make API request to fetch nodes
        const user = await validateUser();
        if (!user) {
            console.error("User not validated.");
            return null;
        }
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

        //parse the data
        return parseNodes(unparsedNodes.data);
    } catch (error) {
        console.error('Error fetching nodes:', error);
        return null;
    }
};

/**
 * Gets all the edges of the network graph
 * @returns An array of edges, or null if there is an error
 */
export async function getEdges(target: Target) {
    // TODO: combine getNodes and getEdges into one function to reduce number of API calls
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
        const nodes = await getNodes(target);
        if (!nodes) {
            console.error("Error fetching nodes.");
            return null;
        }

        // Make API request to fetch nodes
        const fetchedEdges = await fetch(`${STRAPI_URL}/api/edges?populate=*`, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        const unparsedEdges = await fetchedEdges.json();

        // parse the data
        const parsedEdges = parseEdges(unparsedEdges.data);
        return parsedEdges.filter((edge) => edge.sourceId in nodes.map((node) => node.id));
    } catch (error) {
        console.error('Error fetching edges:', error);
        return null;
    }
};

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