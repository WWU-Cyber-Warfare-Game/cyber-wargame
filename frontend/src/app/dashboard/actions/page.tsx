import Link from "next/link";
import ActionFrame from "./_components/ActionFrame";
import { validateUser, getGameState } from "@/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SocketProvider } from "@/components/SocketContext";
import Timer from "@/components/Timer";

/**
 * The action page for the application. Displays the action log and the action selector.
 * @returns 
 */
export default async function ActionPage() {
    const user = await validateUser();
    const jwt = cookies().get("jwt")?.value;
    if (!user || !jwt) {
        redirect("/login");
    }
    const gameState = await getGameState();

    return (
        <div>
            <h2>Actions</h2>
            <Link href="/dashboard/chat">Go to Chat</Link>
            <br />
            <Link href="/dashboard">Go to Dashboard</Link>
            <br />
            {user.team ?
                <SocketProvider jwt={jwt}>
                    {gameState && gameState.endTime &&
                        <>
                            <p>Time left:</p>
                            <Timer time={gameState.endTime} />
                        </>
                    }
                    <ActionFrame user={user} />
                </SocketProvider>
                :
                <p>You are not on a team.</p>
            }
        </div>
    );
}