import Link from "next/link";
import { validateUser, getGameState } from "@/actions";
import { redirect } from "next/navigation";
import ChatFrame from "./_components/ChatFrame";
import { cookies } from "next/headers";
import { SocketProvider } from "@/components/SocketContext";
import Timer from "@/components/Timer";

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

    const gameState = await getGameState();

    return (
        <div>
            <h2>Chat Page</h2>
            <Link href="/dashboard">Back to dashboard</Link>
            <p>Welcome to the chat page!</p>
            <SocketProvider jwt={jwt}>
                {gameState && gameState.endTime &&
                    <>
                        <p>Time left:</p>
                        <Timer time={gameState.endTime} />
                    </>
                }
                <ChatFrame user={user} />
            </SocketProvider>
        </div>
    );
};
