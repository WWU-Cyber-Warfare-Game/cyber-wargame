import { Action } from "@/types";
import styles from "./ActionButton.module.css";

interface ActionButtonProps {
    readonly action: Action;
    readonly onClick: (action: Action) => void;
    readonly disabled?: boolean;
}

export default function ActionButton({ action, onClick, disabled }: Readonly<ActionButtonProps>) {
    return (
        <div
            className={disabled ? styles.actionButtonDisabled : styles.actionButton}
            onClick={() => onClick(action)}
        >
            <p className={styles.actionName}>{action.name}</p>
            <p>{action.description}</p>
            <p>{action.duration} minutes</p>
        </div>
    );
}