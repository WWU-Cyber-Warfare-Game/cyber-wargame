import { Action, Modifiers, ActionType } from "@/types";
import styles from "./ActionButton.module.css";
import classNames from "classnames";

interface ActionButtonProps {
    readonly action: Action;
    readonly onClick: (action: Action) => void;
    readonly disabled?: boolean;
    readonly modifiers: Modifiers;
}

export default function ActionButton({ action, onClick, disabled, modifiers }: Readonly<ActionButtonProps>) {
    const totalModifier = modifiers.buff + (action.type === ActionType.Offense ? modifiers.offense : modifiers.defense);
    return (
        <div
            className={disabled ? styles.actionButtonDisabled : styles.actionButton}
            onClick={() => onClick(action)}
        >
            <p className={classNames(styles.actionName, styles.actionButtonLine)}>{action.name}</p>
            <p className={styles.actionButtonLine}>{action.description}</p>
            <p className={styles.actionButtonLine}>Type: {action.type}</p>
            <p className={styles.actionButtonLine}>{action.duration} minutes</p>
            <p className={styles.actionButtonLine}>Success Rate: {action.successRate}%{(totalModifier > 0) ? ` (+${totalModifier * 10}%)` : ``}</p>
        </div>
    );
}