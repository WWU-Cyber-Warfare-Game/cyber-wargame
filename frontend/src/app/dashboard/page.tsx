import {io} from 'socket.io-client';
import Link from "next/link";

/**
 * The dashboard page for the application. Displays a welcome message and a link to the chat page.
 * @returns 
 */
export default function Dashboard() {
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard.</p>
            <Link href="/dashboard/chat">Go to chat</Link>
        </div>
    );
}