"use client";

import styles from "./SignUpPanel.module.css";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function SignUpPanel() {
    // for testing purposes, set default values
    const defaultEmail = "test@test.com";
    const defaultUsername = "test";
    const defaultPassword = "password";

    const [email, setEmail] = useState(defaultEmail);
    const [username, setUsername] = useState(defaultUsername);
    const [password, setPassword] = useState(defaultPassword);
    const [confirm, setConfirm] = useState(defaultPassword);
    const [error, setError] = useState("");

    const router = useRouter();

    function onEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEmail(event.target.value);
    }

    function onUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setUsername(event.target.value);
    }

    function onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPassword(event.target.value);
    }

    function onConfirmChange(event: React.ChangeEvent<HTMLInputElement>) {
        setConfirm(event.target.value);
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        // check if passwords match
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        } else {
            setError("");
        }

        // send post request to strapi
        try {
            const response = await axios.post("http://localhost:1337/api/auth/local/register", {
                username: username,
                email: email,
                password: password
            });
            router.push("/");
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setError(error.response.data.error.message);
            } else {
                setError("Unknown error");
            }
        }
    }
    
    return (
        <div>
            <form id={styles.form} onSubmit={onSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" onChange={onEmailChange} required defaultValue={defaultEmail} />
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" onChange={onUsernameChange} required defaultValue={defaultUsername} />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" onChange={onPasswordChange} required defaultValue={defaultPassword} />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" onChange={onConfirmChange} required defaultValue={defaultPassword} />
                <button type="submit">Sign Up</button>
            </form>
            <p id={styles.error}>{error}</p>
        </div>
    );
}