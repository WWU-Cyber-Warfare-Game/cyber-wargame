"use client";

import { getMessages } from "@/actions";
import { useEffect, useState, useRef } from "react";
import { Message as MessageInterface, User } from "@/types";
import Message from "./Message";
import styles from "./ChatBox.module.css";
import { Socket } from "socket.io-client";

interface ChatBoxProps {
    readonly user: User;
    readonly receiver: string;
    readonly socket: Socket;
    readonly setError: (error: string) => void;
}

/**
 * A component for displaying a chat between two users and sending messages
 * @param user The user sending the messages
 * @param receiver The username of the user receiving the messages
 * @param socket The socket connection to the server
 * @param setError A function to set an error message
 * @returns 
 */
export default function ChatBox({ user, receiver, socket, setError }: Readonly<ChatBoxProps>) {
    const [messages, setMessages] = useState<MessageInterface[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(true);
    const endOfListRef = useRef<HTMLDivElement>(null);

    // connect to socket server and get messages from the server when component mounts
    useEffect(() => {
        getMessages(receiver).then((messages) => {
            if (messages) {
                setMessages(messages);
                setLoading(false);
            } else {
                setError("Error fetching messages");
            }
        });
    }, [receiver, setError]);

    // join corresponding room when socket connects
    useEffect(() => {
        socket.emit("join-room", [user.username, receiver]);
    }, [user, receiver, socket]);

    // scroll to the end of the message list when new messages are added
    useEffect(() => {
        if (endOfListRef.current) {
            endOfListRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // listen for new messages from the server
    socket.on("message", (message: MessageInterface) => {
        message.date = new Date(message.date);
        setMessages([...messages, message]);
    });

    // listen for errors from the server
    socket.on("error", (error: string) => {
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
                sender: user.username,
                receiver: receiver,
                date: new Date(),
            };

            // Update messages state with the new message
            setMessages([...messages, newMessage]);

            // Clear message input
            setMessageInput("");

            // Send message to the server
            if (socket) socket.emit("message", newMessage, [user.username, receiver]);
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
        </div>
    );
}