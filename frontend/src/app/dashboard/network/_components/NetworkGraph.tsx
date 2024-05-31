import { useEffect, useState } from "react";
import ReactFlow, { Node as ReactFlowNode, Edge as ReactFlowEdge, useNodesState, useEdgesState } from 'reactflow';
import { getGraphData } from "@/actions";
import Dagre from '@dagrejs/dagre';
import { Edge, Graph, Node, Target } from "@/types";
import 'reactflow/dist/style.css';
import styles from './Network.module.css';

interface NetworkGraphProps {
    target: Target;
    graph: Graph;
}

/**
 * Generates a layout for the nodes and edges
 * @param nodes An array of nodes
 * @param edges An array of edges
 * @returns An array of nodes with layouted positions and an array of edges
 */
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB' });

    edges.forEach((edge: Edge) => g.setEdge(edge.sourceId, edge.targetId));
    nodes.forEach((node: Node) => g.setNode(node.id, { label: node.name, width: 144, height: 44 })); // totally arbitrary width and height

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const { x, y } = g.node(node.id);
            const reactFlowNode: ReactFlowNode = {
                id: node.id,
                data: {
                    label: node.name + (node.isCoreNode ? " (Core)" : ""),
                    isCoreNode: node.isCoreNode
                },
                position: { x: x, y: y },
                draggable: false,
                selectable: false,
                connectable: false,
                className: node.defense < 3 ? styles.lowDefense : node.defense < 6 ? styles.mediumDefense : styles.highDefense
            };
            return reactFlowNode;
        }),
        edges: edges.map((edge) => {
            const reactFlowEdge: ReactFlowEdge = {
                id: edge.id,
                source: edge.sourceId,
                target: edge.targetId,
                animated: true
            };
            return reactFlowEdge;
        })
    };
};

// creates the networkGraph component
export default function NetworkGraph({ target, graph }: NetworkGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const layoutedElements = getLayoutedElements(graph.nodes, graph.edges);
        setNodes([...layoutedElements.nodes]);
        setEdges([...layoutedElements.edges]);
    }, [target, graph, setNodes, setEdges]);

    return (
        // must be inside div
        <div style={{ width: '200%', height: '500px', border: 'solid 1px orange', display: "flex", margin: "auto" }}>
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView />
        </div>
    )
};