import Link from "next/link";

export default function Dashboard() {
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard.</p>
            <Link href="/dashboard/chat">Go to chat</Link>
        </div>
    );
}