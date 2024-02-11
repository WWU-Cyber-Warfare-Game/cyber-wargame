import styles from "./Message.module.css";

interface MessageProps {
    message: string;
    sender: string;
}

export default function Message({ message, sender }: MessageProps) {
    return(
        <div id={styles.message}>
            <p id={styles.sender}>{sender}</p>
            <p id={styles.messageText}>{message}</p>
        </div>
    );
}