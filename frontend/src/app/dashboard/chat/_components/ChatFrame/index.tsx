"use client";

import { getTeamUsers, validateUser } from "@/actions";
import { User } from "@/types";
import { useEffect, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import { io, Socket } from "socket.io-client";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ChatFrameProps {
    readonly user: User;
    readonly jwt: string;
}

/**
 * The chat page for the application. Displays a welcome message and a list of team members to chat with.
 * @param user The user currently logged in
 * @param jwt The JSON web token for the user
 * @returns 
 */
export default function ChatFrame({ user, jwt }: Readonly<ChatFrameProps>) {
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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    // connect to socket server and get messages from the server when component mounts
    useEffect(() => {
        const newSocket = io(`${STRAPI_URL}`, {
            auth: {
                token: jwt
            }
        });
        newSocket.on("connect", () => {
            setSocket(newSocket);
        });
        newSocket.on("connect_error", () => {
            setError("Error connecting to socket server");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [jwt]);

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
            {receiver != "" && user && jwt && socket ?
                <ChatBox user={user} receiver={receiver} socket={socket} setError={setError} />
                :
                <p>Select a team member to chat with.</p>
            }
            {error && <p>{error}</p>}
        </div>
    );
};
