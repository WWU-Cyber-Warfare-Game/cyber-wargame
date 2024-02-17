"use client";

import { getMessages } from "@/actions";
import { useEffect, useState, useRef } from "react";
import { Message as MessageInterface } from "@/types";
import Message from "@/components/ChatFrame/Message";
import styles from "./ChatFrame.module.css";
import { io, Socket } from "socket.io-client";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ChatFrameProps {
    sender: string;
    receiver: string;
    jwt: string;
}

/**
 * A component for displaying a chat between two users and sending messages
 * @param sender The username of the user sending the messages
 * @param receiver The username of the user receiving the messages
 * @param jwt The JSON Web Token of the user sending the messages 
 * @returns 
 */
export default function ChatFrame({ sender, receiver, jwt }: ChatFrameProps) {
    // TODO: add connection error handling
    const [messages, setMessages] = useState<MessageInterface[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const endOfListRef = useRef<HTMLDivElement>(null);

    // connect to socket server
    useEffect(() => {
        const newSocket = io(`${STRAPI_URL}/socket/chat`, {
            auth: {
                token: jwt
            }
        });
        setSocket(newSocket);
    }, []);

    // scroll to the end of the message list when new messages are added
    useEffect(() => {
        if (endOfListRef.current) {
            endOfListRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // join corresponding room when component mounts
    useEffect(() => {
        if (socket) socket.emit("join-room", [sender, receiver]);
    }, [sender, receiver, socket]);

    // get messages from the server when component mounts
    useEffect(() => {
        getMessages(receiver).then((messages) => {
            if (messages) {
                setMessages(messages);
            }
        });
    }, [receiver]);

    // listen for new messages from the server
    if (socket) socket.on("message", (message: MessageInterface) => {
        message.date = new Date(message.date);
        setMessages([...messages, message]);
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
            <ul id={styles.messageList}>
                {messages.map((message, index) => (
                    <li key={index}>
                        <Message message={message.message} sender={message.sender} date={message.date} />
                    </li>
                ))}
                <div ref={endOfListRef} />
            </ul>
            <div id={styles.inputContainer}>
                <input
                    type="text"
                    id={styles.messageInput}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendClick();
                    }}
                />
                <button id={styles.sendButton} onClick={handleSendClick}>Send</button>
            </div>
        </div>
    );
}