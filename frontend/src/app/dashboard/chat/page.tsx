import Link from "next/link";
import { getTeamUsers, validateUser } from "@/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./ChatPage.module.css";

export default async function ChatPage() {
    const user = await validateUser();
    if (!user) {
        redirect("/login");
    }

    const teamUsers = await getTeamUsers(user.team.id);
    
    return (
        <div>
            <p>Welcome to the chat page!</p>
            <ul>
                <Link href="/dashboard/chat/team"><li className={styles.chatList}>Team</li></Link>
                {teamUsers.map((teamUser) => (
                    <li className={styles.chatList} key={teamUser.id}>
                        <Link href={`/dashboard/chat/${teamUser.username}`}>
                            {teamUser.teamRole} ({teamUser.username})
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
