import Link from "next/link";
import { getTeamUsers, validateUser } from "@/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./ChatPage.module.css";
import { User } from "@/types";

export default async function ChatPage() {
    const user = await validateUser();
    if (!user) {
        redirect("/login");
    }

    let teamUsers: User[] = [];
    if (user.team)
        teamUsers = await getTeamUsers(user.team.id);

    return (
        <div>
            <p>Welcome to the chat page!</p>
            { user.team ?
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
                :
                <p>You are not currently on a team.</p>
            }
        </div>
    );
};
