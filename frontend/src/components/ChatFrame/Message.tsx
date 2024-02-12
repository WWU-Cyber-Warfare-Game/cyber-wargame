import styles from "./Message.module.css";

interface MessageProps {
    message: string;
    sender: string;
    date: Date;
}

export default function Message({ message, sender, date }: MessageProps) {
    const newDate = new Date(date); // I don't know why I have to do this, but it doesn't work without otherwise
    
    return(
        <div id={styles.message}>
            <p id={styles.sender}>{sender}</p>
            <p id={styles.messageText}>{message}</p>
            <p id={styles.date}>{newDate.toLocaleTimeString()}</p>
        </div>
    );
}