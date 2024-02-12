import styles from "./Message.module.css";

interface MessageProps {
    message: string;
    sender: string;
    date: Date;
}

export default function Message({ message, sender, date }: MessageProps) {
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