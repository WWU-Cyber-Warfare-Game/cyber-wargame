import { useEffect, useState } from "react";
import ReactFlow, { Node, Edge } from 'reactflow';
import { getEdges, getNodes } from "@/actions";
import Dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
// import { populateNetwork } from "@/actions";

// creates the networkGraph component
export default function NetworkGraph() {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

    // layout the elements
    const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
        g.setGraph({ rankdir: 'TB' });

        edges.forEach((edge: Edge) => g.setEdge(edge.source, edge.target));
        nodes.forEach((node: Node) => g.setNode(node.id, node.data.label));

        Dagre.layout(g);

        return {
            nodes: nodes.map((node) => {
                const { x, y } = g.node(node.id);
                node.position = { x, y };

                return node;
            }),
            edges
        };
    };

    // fetch the network from strapi
    useEffect(() => {
        getNodes().then((nodes) => {
            console.log(nodes);
        });
        getEdges().then((edges) => {
            console.log(edges);
        });
    }, []);

    const nodes: Node[] = [
        { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 50 } },
        { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } }
    ];

    const edges: Edge[] = [
        { id: 'e1-2', source: '1', target: '2', animated: true }
    ];

    return (
        // must be inside div
        <div style={{ width: '100%', height: '500px', border: 'solid 1px red', }}>
            <ReactFlow nodes={nodes} edges={edges} fitView />
        </div>
    )
};