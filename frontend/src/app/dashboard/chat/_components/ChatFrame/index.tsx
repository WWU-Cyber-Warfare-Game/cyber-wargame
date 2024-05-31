"use client";

import { getTeamUsers, validateUser } from "@/actions";
import { User } from "@/types";
import { useEffect, useState, useContext } from "react";
import ChatBox from "./ChatBox";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "@/components/SocketContext";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ChatFrameProps {
    readonly user: User;
}

/**
 * The chat page for the application. Displays a welcome message and a list of team members to chat with.
 * @param user The user currently logged in
 * @param jwt The JSON web token for the user
 * @returns 
 */
export default function ChatFrame({ user }: Readonly<ChatFrameProps>) {
    /**
     * Capitalizes the first letter of a string
     * @param s A string to capitalize
     * @returns Capitalized string
     */
    function capitalize(s: string) {
        if (s.length === 0) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setReceiver(event.target.value);
        console.log(receiver);
    }

    const [receiver, setReceiver] = useState<string>("");
    const [teamUsers, setTeamUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { socket } = useContext(SocketContext);

    // get the team members when the component mounts
    useEffect(() => {
        async function fetchTeamUsers() {
            if (user.team) {
                const ret = await getTeamUsers(user.team);
                setTeamUsers(ret);
            }
        }

        fetchTeamUsers();
    }, [user]);

    return (
        <div>
            {user.team ?
                <div>
                    <select onChange={handleSelectChange}>
                        <option value="">--- Select a team member to chat with ---</option>
                        {teamUsers
                            .filter(teamUser => teamUser.username !== user.username)
                            .map((teamUser) => (
                                <option key={teamUser.username} value={teamUser.username}>{capitalize(teamUser.teamRole)} ({teamUser.username})</option>
                            ))}
                    </select>
                </div>
                :
                <p>You are not currently on a team.</p>
            }
            {receiver != "" && user && socket ?
                <ChatBox user={user} receiver={receiver} socket={socket} setError={setError} />
                :
                <p>Select a team member to chat with.</p>
            }
            {error && <p>{error}</p>}
        </div>
    );
};
