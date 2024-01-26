"use client";

import styles from "./LogInPanel.module.css";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function LogInPanel() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    function onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEmail(event.target.value);
    }

    function onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPassword(event.target.value);
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // send post request to strapi
        try {
            const response = await axios.post("http://localhost:1337/api/auth/local", {
                identifier: email,
                password: password
            });
            router.push("/");
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.error.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    }
    
    return (
        <div>
            <form id={styles.form} onSubmit={onSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" onChange={onEmailChange} required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" onChange={onPasswordChange} required />
                <button type="submit">Log In</button>
            </form>
            <p id={styles.error}>{error}</p>
        </div>
    );
}