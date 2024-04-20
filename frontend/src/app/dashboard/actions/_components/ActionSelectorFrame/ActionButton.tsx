import { Action } from "@/types";
import styles from "./ActionButton.module.css";
import classNames from "classnames";

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
            <p className={classNames(styles.actionName, styles.actionButtonLine)}>{action.name}</p>
            <p className={styles.actionButtonLine}>{action.description}</p>
            <p className={styles.actionButtonLine}>Type: {action.type}</p>
            <p className={styles.actionButtonLine}>{action.duration} minutes</p>
            <p className={styles.actionButtonLine}>Success Rate: {action.successRate}%</p>
        </div>
    );
}