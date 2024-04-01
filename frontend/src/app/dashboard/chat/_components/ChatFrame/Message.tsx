import styles from "./Message.module.css";

interface MessageProps {
    readonly message: string;
    readonly sender: string;
    readonly date: Date;
}

/**
 * A component for displaying a message
 * @param message The message to display
 * @param sender The sender of the message
 * @param date The date and time the message was sent
 * @returns 
 */
export default function Message({ message, sender, date }: Readonly<MessageProps>) {
    return(
        <div id={styles.message}>
            <div id={styles.senderMessage}>
                <p id={styles.sender}>{sender}</p>
                <p id={styles.messageText}>{message}</p>
            </div>
            <p id={styles.date}>{date.toLocaleTimeString()}</p>
        </div>
    );
}