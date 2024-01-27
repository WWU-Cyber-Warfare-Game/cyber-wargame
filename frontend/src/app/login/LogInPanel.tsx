"use client";

import styles from "./LogInPanel.module.css";
import { useState } from "react";
import axios, { AxiosError, isAxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function LogInPanel() {
    const [error, setError] = useState("");

    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        // send post request to strapi
        try {
            const response = await axios.post("http://localhost:1337/api/auth/local", { // TODO: allow for custom API URL
                identifier: email,
                password: password
            });
            console.log("JWT: " + response.data.jwt); // TODO: remove, for debugging only
            router.push("/");
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.error.message);
            } else if (isAxiosError(error)) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    }
    
    return (
        <div>
            <form id={styles.form} onSubmit={onSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />
                <button type="submit">Log In</button>
            </form>
            <p id={styles.error}>{error}</p>
        </div>
    );
}