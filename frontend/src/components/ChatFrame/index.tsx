"use client";

import { getMessages } from "@/actions";
import { useEffect, useState } from "react";
import { Message as MessageInterface } from "@/types";
import Message from "@/components/ChatFrame/Message";
import styles from "./ChatFrame.module.css";
import { io } from "socket.io-client";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const socket = io(STRAPI_URL);

interface ChatFrameProps {
    sender: string;
    receiver: string;
}

export default function ChatFrame({ sender, receiver }: ChatFrameProps) {
    const [messages, setMessages] = useState<MessageInterface[]>([]);
    const [messageInput, setMessageInput] = useState("");
    
    useEffect(() => {
        getMessages(receiver).then((messages) => {
            if (messages) {
                setMessages(messages);
            }
        });
    }, [receiver]);

    socket.on("message", (message: MessageInterface) => {
        message.date = new Date(message.date);
        setMessages([...messages, message]);
    });

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setMessageInput(event.target.value);
    }

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
            socket.emit("message", newMessage);
        }
    }
    
    return(
        <div id={styles.chatFrame}>
            <ul id={styles.messageList}>
                {messages.map((message) => (
                    <li key={message.date.valueOf()}>
                        <Message message={message.message} sender={message.sender} date={message.date} />
                    </li>
                ))}
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