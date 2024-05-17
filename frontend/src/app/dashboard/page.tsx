import Link from "next/link";
import NetworkFrame from "./network/NetworkFrame";
import "./dashboard.css";
/**
 * The dashboard page for the application. Displays a welcome message and a link to the chat page.
 * @returns 
 */
export default function Dashboard() {
    return (        
        <div className="dashNav">
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard.</p>
            <Link href="/dashboard/chat"><p>Go to chat</p></Link>
            <Link href="/dashboard/actions"><p>Go to actions</p></Link>
            <NetworkFrame></NetworkFrame>
        </div>
    );
}