import { Action, Modifiers, ActionType } from "@/types";
import styles from "./ActionButton.module.css";
import classNames from "classnames";
import { MODIFIER_RATE } from "@/consts";
import { getGraphData } from "@/actions";
import { useContext, useEffect, useState } from "react";
import { Node, Edge } from "@/types";
import { TargetContext } from "../TargetContext";

interface ActionButtonProps {
    readonly action: Action;
    readonly onClick: (action: Action, selectedNode?: number, selectedEdge?: number) => void;
    readonly disabled?: boolean;
    readonly modifiers: Modifiers;
    readonly setButtonDisabled: (disabled: boolean) => void;
}

interface EdgeWithName extends Edge {
    name: string;
}

export default function ActionButton({ action, onClick, disabled, modifiers, setButtonDisabled }: Readonly<ActionButtonProps>) {
    const totalModifier = modifiers.buff + (action.type === ActionType.Offense ? modifiers.offense : modifiers.defense);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<EdgeWithName[]>([]);
    const [targetedActionSelected, setTargetedActionSelected] = useState(false);
    const { teamGraph, opponentGraph } = useContext(TargetContext);

    function handleClick() {
        if (disabled) return;
        if (action.targetsNode || action.targetsEdge) {
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

    useEffect(() => {
        async function getTargets() {
            if (action.targetsNode) {
                if (action.targetsNode === "team") setNodes(teamGraph.nodes);
                else setNodes(opponentGraph.nodes);
            }
            if (action.targetsEdge) {
                const fetchedEdges = action.targetsEdge === "team" ? teamGraph.edges : opponentGraph.edges;
                const fetchedNodes = action.targetsEdge === "team" ? teamGraph.nodes : opponentGraph.nodes;
                const edgesWithName = fetchedEdges.map((edge) => {
                    const sourceNode = fetchedNodes.find((node) => node.id === edge.sourceId);
                    const targetNode = fetchedNodes.find((node) => node.id === edge.targetId);
                    return { ...edge, name: `${sourceNode?.name} -> ${targetNode?.name}` };
                });
                setEdges(edgesWithName);
            }
        }

        getTargets();
    }, [action, opponentGraph, teamGraph]);

    // TODO: be able to have different kinds of (and multiple) targets
    if (action.targetsNode && action.targetsEdge)
        return (
            <div
                className={disabled ? styles.actionButtonDisabled : styles.actionButton}
            >
                <p>Cannot target both a node and an edge</p>
            </div>
        );
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
            {targetedActionSelected && action.targetsNode &&
                <div className={styles.actionButtonLine}>
                    <button onClick={cancelSelect}>Cancel</button>
                    <select name="target" id="target" defaultValue={""} onChange={handleNodeSelect}>
                        <option value="" disabled>Select a target</option>
                        {nodes.map((node) => (
                            <option value={node.id} key={node.id}>{node.name}</option>
                        ))}
                    </select>
                </div>
            }
            {targetedActionSelected && action.targetsEdge &&
                <div className={styles.actionButtonLine}>
                    <button onClick={cancelSelect}>Cancel</button>
                    <select name="target" id="target" defaultValue={""} onChange={handleEdgeSelect}>
                        <option value="" disabled>Select a target</option>
                        {edges.map((edge) => (
                            <option value={edge.id} key={edge.id}>{edge.name}</option>
                        ))}
                    </select>
                </div>
            }
        </div>
    );
}