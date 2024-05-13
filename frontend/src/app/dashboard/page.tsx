import Link from "next/link";
import NetworkFrame from "./network/NetworkFrame";
import { SocketProvider } from "@/components/SocketContext";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getGameState } from "@/actions";
import Timer from "@/components/Timer";

/**
 * The dashboard page for the application. Displays a welcome message and a link to the chat page.
 * @returns 
 */
export default async function Dashboard() {
    const jwt = cookies().get("jwt")?.value;
    if (!jwt) {
        redirect("/login");
    }

    const gameState = await getGameState();

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard.</p>
            <Link href="/dashboard/chat"><p>Go to chat</p></Link>
            <Link href="/dashboard/actions"><p>Go to actions</p></Link>
            <SocketProvider jwt={jwt}>
                {gameState && gameState.endTime &&
                    <>
                        <p>Time left:</p>
                        <Timer time={gameState.endTime} />
                    </>
                }
                <NetworkFrame />
            </SocketProvider>
        </div>
    );
}