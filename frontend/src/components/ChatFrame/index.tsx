"use client";

import { getMessages } from "@/actions";
import { useEffect, useState, useRef } from "react";
import { Message as MessageInterface } from "@/types";
import Message from "@/components/ChatFrame/Message";
import styles from "./ChatFrame.module.css";
import { io, Socket } from "socket.io-client";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ChatFrameProps {
    readonly sender: string;
    readonly receiver: string;
    readonly jwt: string;
}

/**
 * A component for displaying a chat between two users and sending messages
 * @param sender The username of the user sending the messages
 * @param receiver The username of the user receiving the messages
 * @param jwt The JSON Web Token of the user sending the messages 
 * @returns 
 */
export default function ChatFrame({ sender, receiver, jwt }: Readonly<ChatFrameProps>) {
    // TODO: add connection error handling
    const [messages, setMessages] = useState<MessageInterface[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const endOfListRef = useRef<HTMLDivElement>(null);

    // connect to socket server and get messages from the server when component mounts
    useEffect(() => {
        const newSocket = io(`${STRAPI_URL}/socket/chat`, {
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

        getMessages(receiver).then((messages) => {
            if (messages) {
                setMessages(messages);
                setLoading(false);
            } else {
                setError("Error fetching messages");
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // join corresponding room when socket connects
    useEffect(() => {
        if (socket) socket.emit("join-room", [sender, receiver]);
    }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

    // scroll to the end of the message list when new messages are added
    useEffect(() => {
        if (endOfListRef.current) {
            endOfListRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // listen for new messages from the server
    if (socket) socket.on("message", (message: MessageInterface) => {
        message.date = new Date(message.date);
        setMessages([...messages, message]);
    });

    // listen for errors from the server
    if (socket) socket.on("error", (error: string) => {
        setError(error);
    });

    // update message input state when user types
    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setMessageInput(event.target.value);
    }

    // send message to the server and update messages state
    function handleSendClick() {
        if (messageInput.trim() !== "") {
            const newMessage: MessageInterface = {
                message: messageInput,
                sender: sender,
                receiver: receiver,
                date: new Date(),
            };

            // Update messages state with the new message
            setMessages([...messages, newMessage]);

            // Clear message input
            setMessageInput("");

            // Send message to the server
            if (socket) socket.emit("message", newMessage, [sender, receiver]);
        }
    }

    return (
        <div id={styles.chatFrame}>
            {loading ? <p>Loading messages...</p> :
                <ul id={styles.messageList}>
                    {messages.map((message, index) => (
                        <li key={index}>
                            <Message message={message.message} sender={message.sender} date={message.date} />
                        </li>
                    ))}
                    <div ref={endOfListRef} />
                </ul>
            }
            {error !== "" ? <p id={styles.error}>{error}</p> :
                <div id={styles.inputContainer}>
                    <input
                        type="text"
                        id={styles.messageInput}
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendClick();
                        }}
                        disabled={loading}
                    />
                    <button id={styles.sendButton} onClick={handleSendClick} disabled={loading}>Send</button>
                </div>
            }
        </div>
    );
}