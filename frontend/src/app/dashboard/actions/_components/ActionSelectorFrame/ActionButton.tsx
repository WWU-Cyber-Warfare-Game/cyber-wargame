import { Action, Modifiers, ActionType, Graph } from "@/types";
import styles from "./ActionButton.module.css";
import classNames from "classnames";
import { MODIFIER_RATE } from "@/consts";
import { getGraphData } from "@/actions";
import { useContext, useEffect, useState } from "react";
import { Node, Edge } from "@/types";

interface ActionButtonProps {
    readonly action: Action;
    readonly onClick: (action: Action, selectedNode?: number, selectedEdge?: number) => void;
    readonly disabled?: boolean;
    readonly modifiers: Modifiers;
    readonly setUserFunds: (userFunds: number) => void;
    readonly setButtonDisabled: (disabled: boolean) => void;
    readonly teamGraph: Graph;
    readonly opponentGraph: Graph;
    readonly userFunds: number;
}

interface EdgeWithName extends Edge {
    name: string;
}

export default function ActionButton({ action, onClick, disabled, modifiers, userFunds, setButtonDisabled, teamGraph, opponentGraph }: Readonly<ActionButtonProps>) {
    const totalModifier = modifiers.buff + (action.type === ActionType.Offense ? modifiers.offense : modifiers.defense);
    const [targetedActionSelected, setTargetedActionSelected] = useState(false);

    function handleClick() {
        if (disabled || userFunds < action.cost) return;
        if (action.targets) {
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

    function handleNodeSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        const nodeId = parseInt(event.target.value);
        setTargetedActionSelected(false);
        onClick(action, nodeId);
    }

    function handleEdgeSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        const edgeId = parseInt(event.target.value);
        setTargetedActionSelected(false);
        onClick(action, undefined, edgeId);
    }

    let edgesWithName: EdgeWithName[] = [];
    if (action.targets) {
        const fetchedEdges = action.targets.myTeam ? teamGraph.edges : opponentGraph.edges;
        const fetchedNodes = action.targets.myTeam ? teamGraph.nodes : opponentGraph.nodes;
        edgesWithName = fetchedEdges.map((edge) => {
            const sourceNode = fetchedNodes.find((node) => node.id === edge.sourceId);
            const targetNode = fetchedNodes.find((node) => node.id === edge.targetId);
            return { ...edge, name: `${sourceNode?.name} -> ${targetNode?.name}` };
        });
    }
    // console.log(userFunds < action.cost);
    // console.log("Name: " + action.name);
    console.log("UserFunds: " + userFunds);
    return (
        <div
            className={disabled ? styles.actionButtonDisabled : userFunds < action.cost ? styles.actionButtonInvalidFunds: styles.actionButton}
            onClick={handleClick}
        >
            <p className={classNames(styles.actionName, styles.actionButtonLine)}>{action.name}</p>
            <p className={styles.actionButtonLine}>Cost: {action.cost}</p>
            <p className={styles.actionButtonLine}>{action.description}</p>
            <p className={styles.actionButtonLine}>Type: {action.type}</p>
            <p className={styles.actionButtonLine}>{action.duration} minutes</p>
            <p className={styles.actionButtonLine}>Success Rate: {action.successRate}%{(totalModifier > 0) ? ` (+${totalModifier * MODIFIER_RATE}%)` : ``}</p>
            {targetedActionSelected &&
                <div className={styles.actionButtonLine}>
                    <button onClick={cancelSelect}>Cancel</button>
                    {action.targets?.target === "node" &&
                        <select name="target" id="target" defaultValue={""} onChange={handleNodeSelect}>
                            <option value="" disabled>Select a target</option>
                            {(action.targets.myTeam ? teamGraph.nodes : opponentGraph.nodes).map((node) => (
                                <option value={node.id} key={node.id}>{node.name}</option>
                            ))}
                        </select>
                    }
                    {action.targets?.target === "edge" &&
                        <select name="target" id="target" defaultValue={""} onChange={handleEdgeSelect}>
                            <option value="" disabled>Select a target</option>
                            {edgesWithName.map((edge) => (
                                <option value={edge.id} key={edge.id}>{edge.name}</option>
                            ))}
                        </select>
                    }
                </div>
            }
        </div>
    );
}