"use client";

import { getMessages } from "@/actions";
import { useEffect, useState } from "react";
import { Message as MessageInterface } from "@/types";
import Message from "@/components/ChatFrame/Message";
import styles from "./ChatFrame.module.css";

interface ChatFrameProps {
    slug: string;
}

export default function ChatFrame({ slug }: ChatFrameProps) {
    const [messages, setMessages] = useState<MessageInterface[]>([]);
    
    useEffect(() => {
        getMessages(slug).then((messages) => {
            if (messages) {
                setMessages(messages);
            }
        });
    }, [slug]);
    
    return(
        <div>
            <ul id={styles.messageList}>
                {messages.map((message) => (
                    <li key={message.date.valueOf()}>
                        <Message message={message.message} sender={message.sender} />
                    </li>
                ))}
            </ul>
        </div>
    );
}