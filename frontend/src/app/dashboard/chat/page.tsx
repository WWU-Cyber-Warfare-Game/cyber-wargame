import Link from "next/link";
import { getTeamUsers, validateUser } from "@/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./ChatPage.module.css";
import { User } from "@/types";

/**
 * The chat page for the application. Displays a welcome message and a list of team members to chat with.
 * @returns 
 */
export default async function ChatPage() {
    
    /**
     * Capitalizes the first letter of a string
     * @param s A string to capitalize
     * @returns Capitalized string
     */
    function capitalize(s: string) {
        if (s.length === 0) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // check if user is logged in, if not redirect to login page
    const user = await validateUser();
    if (!user) {
        redirect("/login");
    }

    // get team members if user is on a team
    let teamUsers: User[] = [];
    let teamName;
    if (user.team) {
        teamUsers = await getTeamUsers(user.team);
        teamName = user.team;
    }

    return (
        <div>
            <p>Welcome to the chat page!</p>
            {user.team ?
                <ul>
                    {teamUsers
                        .filter(teamUser => teamUser.username !== user.username)
                        .map((teamUser) => (
                            <li className={styles.chatList} key={teamUser.username}>
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
