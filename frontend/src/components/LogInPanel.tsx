"use client";

import styles from './LogInPanel.module.css';
import { useEffect, useState } from "react";
import { emailRegex, passwordRegex, usernameRegex } from '@/regex';
import { logIn, signUp } from '@/actions';
import { useFormState } from 'react-dom';

interface LogInPanelProps {
    readonly signup?: boolean;
}

/**
 * A form for logging in or signing up
 * @param signup Whether the form should be for signing up or logging in 
 * @returns 
 */
export default function LogInPanel({ signup }: Readonly<LogInPanelProps>) {
    const formAction = signup ? signUp : logIn;
    const [serverError, dispatch] = useFormState(formAction, null);
    const [error, setError] = useState("");
    useEffect(() => {
        setError(serverError);
    }, [serverError]);

    return (
        <div>
            {signup ?
                /* Sign up form */
                <form id={styles.form} onSubmit={() => setError("")} action={dispatch}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        className={styles.input}
                        name="email"
                        pattern={emailRegex.source}
                        required
                    />
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        className={styles.input}
                        name="username"
                        pattern={usernameRegex.source}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        className={styles.input}
                        name="password"
                        pattern={passwordRegex.source}
                        required
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className={styles.input}
                        name="confirmPassword"
                        pattern={passwordRegex.source}
                        required
                    />
                    <button type="submit">Sign Up</button>
                </form>
                :
                /* Log in form */
                <form id={styles.form} action={dispatch}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" className={styles.input} name="email" required />
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" className={styles.input} name="password" required />
                    <button type="submit">Log In</button>
                </form>
            }
            {/* Error message returned from server */}
            <p id={styles.error}>{error}</p>
        </div>
    );
}