import { Action, Modifiers, ActionType } from "@/types";
import styles from "./ActionButton.module.css";
import classNames from "classnames";
import { MODIFIER_RATE } from "@/consts";
import { getNodes } from "@/actions";
import { useEffect, useState } from "react";
import { Node } from "@/types";

interface ActionButtonProps {
    readonly action: Action;
    readonly onClick: (action: Action, selectedNode?: number) => void;
    readonly disabled?: boolean;
    readonly modifiers: Modifiers;
    readonly setButtonDisabled: (disabled: boolean) => void;
}

export default function ActionButton({ action, onClick, disabled, modifiers, setButtonDisabled }: Readonly<ActionButtonProps>) {
    const totalModifier = modifiers.buff + (action.type === ActionType.Offense ? modifiers.offense : modifiers.defense);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [targetedActionSelected, setTargetedActionSelected] = useState(false);

    function handleClick() {
        if (disabled) return;
        if (action.targetsNode) {
            setTargetedActionSelected(true);
            setButtonDisabled(true);
        }
        else {
            onClick(action);
        }
    }

    function cancelSelect(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        setTargetedActionSelected(false);
        setButtonDisabled(false);
    }

    function handleNodeSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const nodeId = parseInt(event.target.value);
        setTargetedActionSelected(false);
        onClick(action, nodeId);
    }

    useEffect(() => {
        if (action.targetsNode) {
            getNodes(true).then((nodes) => {
                if (nodes) setNodes(nodes);
                else console.error("Error fetching nodes");
            });
        }
    }, [action]);

    return (
        <div
            className={disabled ? styles.actionButtonDisabled : styles.actionButton}
            onClick={handleClick}
        >
            <p className={classNames(styles.actionName, styles.actionButtonLine)}>{action.name}</p>
            <p className={styles.actionButtonLine}>{action.description}</p>
            <p className={styles.actionButtonLine}>Type: {action.type}</p>
            <p className={styles.actionButtonLine}>{action.duration} minutes</p>
            <p className={styles.actionButtonLine}>Success Rate: {action.successRate}%{(totalModifier > 0) ? ` (+${totalModifier * MODIFIER_RATE}%)` : ``}</p>
            {targetedActionSelected &&
                <div className={styles.actionButtonLine}>
                    <button onClick={cancelSelect}>Cancel</button>
                    <select name="target" id="target" defaultValue={""} onChange={handleNodeSelectChange}>
                        <option value="" disabled>Select a target</option>
                        {nodes.map((node) => (
                            <option value={node.id} key={node.id}>{node.name}</option>
                        ))}
                    </select>
                </div>
            }
        </div>
    );
}