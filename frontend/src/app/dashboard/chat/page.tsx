import Link from "next/link";
import { getTeamUsers, validateUser } from "@/actions";
import { redirect } from "next/navigation";
import styles from "./ChatPage.module.css";
import { User } from "@/types";
import { useEffect, useRef, useState } from "react";
import ChatFrame from "./_components/ChatFrame";
import { cookies } from "next/headers";

/**
 * The chat page for the application. Displays a welcome message and a list of team members to chat with.
 * @returns 
 */
export default async function ChatPage() {
    const jwt = cookies().get("jwt")?.value;
    const user = await validateUser();

    if (!user || !jwt) {
        redirect("/login");
    }

    return (
        <div>
            <h2>Chat Page</h2>
            <Link href="/dashboard">Back to dashboard</Link>
            <p>Welcome to the chat page!</p>
            <ChatFrame user={user} jwt={jwt} />
        </div>
    );
};
