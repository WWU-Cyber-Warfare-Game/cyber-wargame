import Link from "next/link";
import { getTeamUsers, validateUser } from "@/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChatPage() {
    const jwt = cookies().get("jwt")?.value;
    const user = await validateUser(jwt);

    if (!user) {
        redirect("/login");
    }

    const teamUsers = await getTeamUsers(user.team.id);
    
    return (
        <div>
            <h2>Chat Page</h2>
            <Link href="/dashboard">Back to dashboard</Link>
            <p>Welcome to the chat page!</p>
            <ul>
                <li>Team</li>
                {teamUsers.map((teamUser) => (
                    <li key={teamUser.id}>{teamUser.username} ({teamUser.teamRole})</li>
                ))}
            </ul>
        </div>
    );
};
