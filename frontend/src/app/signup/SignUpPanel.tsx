"use client";

import styles from "./SignUpPanel.module.css";
import { useState } from "react";
import axios, { AxiosError, isAxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function SignUpPanel() {
    const [error, setError] = useState("");

    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const username = formData.get("username");
        const password = formData.get("password");
        const confirm = formData.get("confirmPassword");
        
        // check if passwords match
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        } else {
            setError("");
        }

        // send post request to strapi
        try {
            const response = await axios.post("http://localhost:1337/api/auth/local/register", { // TODO: allow for custom API URL
                username: username,
                email: email,
                password: password
            });
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
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required />
                <button type="submit">Sign Up</button>
            </form>
            <p id={styles.error}>{error}</p>
        </div>
    );
}