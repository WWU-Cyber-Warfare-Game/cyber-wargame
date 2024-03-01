"use server";

import { z } from "zod";
import { emailRegex, usernameRegex, passwordRegex } from "./regex";
import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Message, Action, ActionLog} from "./types";
import qs from "qs";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Parses the user data retreived from Strapi.
 * @param data The data retreived from the Strapi API
 * @returns The parsed user data
 */
function parseUser(data: any) {
    let team;
    if (!data.team) team = null;
    else team = data.team.name;

    return {
        username: data.username,
        email: data.email,
        teamRole: data.teamRole,
        team: team
    } as User;
}

function parseActionLog(data: any): ActionLog {
    console.log (data);
    return {
        action: data.attributes.action.data.attributes,
        team: data.attributes.team.data.attributes.name,
        time: new Date(Date.parse(data.attributes.createdAt))
    }
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

export async function getActionLog() {  
    const user= await validateUser();
    if (!user) {
        console.error("User not validated.");
        return null;
    }
    try {  
    const res = await fetch(`${STRAPI_URL}/api/resolved-actions?populate=*&filters[team][name][$eq]=${user.team}`, {
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`
        }
    });

    if (res.ok) {
        const data = await res.json();
       // console.log (data.data[0].attributes);
        console.log (data);
            return data.data.map((action: any) => {
                console.log(parseActionLog(action));
                return  parseActionLog(action);
            });
      } else {
        console.error('Failed to fetch action log:', res.status, res.statusText);
        return [] as ActionLog[];
      }
    } catch (error) {
      console.error('Error fetching action log:', error);
      return [] as ActionLog[];
  }
}
