import {io} from 'socket.io-client';
import Link from "next/link";

const socket = io('http://localhost:1337');

export default function Dashboard() {
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard.</p>
            <Link href="/dashboard/chat">Go to chat</Link>
            <Link href="/dashboard/actionLog">Go to action log</Link>
        </div>
    );
}