"use client";

import styles from './LogInPanel.module.css';
import { useState } from "react";
import axios, { AxiosError, isAxiosError } from "axios";
import { useRouter } from "next/navigation";

interface LogInPanelProps {
    signup?: boolean;
}

export default function LogInPanel(props: LogInPanelProps) {
    const [error, setError] = useState("");

    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const formData = new FormData(event.currentTarget);
        
        // check if passwords match
        if (props.signup && formData.get("password") !== formData.get("confirmPassword")) {
            setError("Passwords do not match");
            return;
        }

        // send post request to strapi
        try {
            if (props.signup) {
                const email = formData.get("email");
                const username = formData.get("username");
                const password = formData.get("password");
                await axios.post("http://localhost:1337/api/auth/local/register", { // TODO: allow for custom API URL
                    username: username,
                    email: email,
                    password: password
                });
            } else {
                const email = formData.get("email");
                const password = formData.get("password");
                await axios.post("http://localhost:1337/api/auth/local", { // TODO: allow for custom API URL
                    identifier: email,
                    password: password
                });
            }
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
            {props.signup ? 
                <form id={styles.form} onSubmit={onSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required />
                <button type="submit">{props.signup ? "Sign Up" : "Log In"}</button>
            </form>
            :
            <form id={styles.form} onSubmit={onSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />
                <button type="submit">Log In</button>
            </form>
            }
            <p id={styles.error}>{error}</p>
        </div>
    );
}