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
            <Link href="/dashboard/chat"><p>Go to chat</p></Link>
            <Link href="/dashboard/action-log"><p>Go to action log</p></Link>
        </div>
    );
}