import { Action } from "@/types";
import styles from "./ActionButton.module.css";

interface ActionButtonProps {
    readonly action: Action;
}

export default function ActionButton({ action }: Readonly<ActionButtonProps>) {
    return (
        <div className={styles.actionButton}>
            <p className={styles.actionName}>{action.name}</p>
            <p>{action.description}</p>
            <p>{action.duration} minutes</p>
        </div>
    );
}