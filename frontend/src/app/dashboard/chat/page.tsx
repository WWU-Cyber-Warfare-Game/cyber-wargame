import Link from "next/link";

export default function ChatPage() {
    return (
        <div>
            <h2>Chat Page</h2>
            <p>Welcome to the chat page!</p>
            <Link href="/dashboard">Go to dashboard</Link>
        </div>
    );
};
