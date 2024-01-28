"use server";

import { z } from "zod";
import { emailRegex, usernameRegex, passwordRegex } from "./regex";
import axios, { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "./types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

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

export async function validateUser(jwt: string | undefined) {
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
            Authorization: `Bearer ${jwt}`
        }
    });

    if (res.ok) {
        return await res.json() as User;
    } else {
        return null;
    }
}