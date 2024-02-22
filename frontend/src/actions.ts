"use server";

import { z } from "zod";
import { emailRegex, usernameRegex, passwordRegex } from "./regex";
import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Message, ActionLog} from "./types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

function parseUser(data: any): User {
    return {
        username: data.username,
        email: data.email,
        teamRole: data.teamRole,
        team: data.team.name
    }
}

function parseActionLog(data: any): ActionLog {
    console.log (data);
    return {
        name: data.name,
        duration: data.duration,
        description: data.description,
        teamRole: data.teamRole
    }
}

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
        console.error(error);
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data.error.message;
        } else if (isAxiosError(error)) {
            return error.message;
        } else {
            return "An unknown error occurred";
        }
    }
    redirect("/dashboard");
}

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
        // return null;
    } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data.error.message;
        } else if (isAxiosError(error)) {
            return error.message;
        } else {
            return "An unknown error occurred";
        }
    }
    redirect("/dashboard");
}

export async function logOut() {
    cookies().delete("jwt");
    redirect("/");
}

export async function validateUser() {
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
    } else {
        return null;
    }
}

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

export async function getMessages(username: string) {
    // also this is really ugly and not good TypeScript code but Strapi is being a pain in the ass

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

    /**
     * FIXME: Due to pagination and the messages being retreived using two API calls, if one user has many more messages
     * than the other, some of their messages will be missing.
     * Messages should be retreived using one API call to avoid this, but I can't figure out how to combine them.
     * If I can't figure out how to do this, just increase the maxLimit in api.ts to something really high.
     */

    // get messages where user is sender and username is receiver
    const res1 = await fetch(`${STRAPI_URL}/api/messages?pagination[limit]=100&sort[0]=date:desc&populate=*&filters[sender][$eq]=${user.username}&filters[receiver][$eq]=${username}`, {
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`
        }
    });

    if (!res1.ok) {
        console.error(res1);
        return null;
    }

    const data1 = await res1.json();

    // get messages where username is sender and user is receiver
    const res2 = await fetch(`${STRAPI_URL}/api/messages?pagination[limit]=100&sort[0]=date:desc&populate=*&filters[sender][$eq]=${username}&filters[receiver][$eq]=${user.username}`, {
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`
        }
    });

    if (!res2.ok) {
        console.error(res2);
        return null;
    }

    const data2 = await res2.json();

    return [...parseResponseData(data1.data), ...parseResponseData(data2.data)].sort((a, b) => a.date.valueOf() - b.date.valueOf());
}

export async function getActionLog() {
  try {  
    const res = await fetch(`${STRAPI_URL}/api/actions?populate=*`, {
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`
        }
    });

    if (res.ok) {
        const data = await res.json();
        console.log (data.data[0].attributes);
        return data.data.map((action: any) => parseActionLog(action.attributes));;
      } else {
        console.error('Failed to fetch action log:', res.status, res.statusText);
        return [] as ActionLog[];
      }
    } catch (error) {
      console.error('Error fetching action log:', error);
      return [] as ActionLog[];
  }
}
