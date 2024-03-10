import { Action } from "@/types";
import styles from "./ActionButton.module.css";

interface ActionButtonProps {
    readonly action: Action;
    readonly onClick: (action: Action) => void;
}

export default function ActionButton({ action, onClick }: Readonly<ActionButtonProps>) {
    return (
        <div className={styles.actionButton} onClick={() => onClick(action)}>
            <p className={styles.actionName}>{action.name}</p>
            <p>{action.description}</p>
            <p>{action.duration} minutes</p>
        </div>
    );
}