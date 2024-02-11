import Link from "next/link";
import { getTeamUsers, validateUser } from "@/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./ChatPage.module.css";
import { User } from "@/types";

export default async function ChatPage() {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const user = await validateUser();
    if (!user) {
        redirect("/login");
    }

    let teamUsers: User[] = [];
    let teamName;
    if (user.team) {
        teamUsers = await getTeamUsers(user.team.id);
        teamName = user.team.name;
    }

    return (
        <div>
            <p>Welcome to the chat page!</p>
            {user.team ?
                <ul>
                    <Link href="/dashboard/chat/team"><li className={styles.chatList}>{teamName}</li></Link>
                    {teamUsers
                        .filter(teamUser => teamUser.username !== user.username)
                        .map((teamUser) => (
                            <li className={styles.chatList} key={teamUser.id}>
                                <Link href={`/dashboard/chat/${teamUser.username}`}>
                                    {capitalize(teamUser.teamRole)} ({teamUser.username})
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
