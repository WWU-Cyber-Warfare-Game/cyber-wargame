import { useEffect, useState } from "react";
import ReactFlow, { Node, Edge } from 'reactflow';
import { getEdges, getNodes } from "@/actions";
import Dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
// import { populateNetwork } from "@/actions";

// creates the networkGraph component
export default function NetworkGraph() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // fetch the network from strapi
    useEffect(() => {
        getNodes().then((nodes) => {
            console.log(nodes);
        });
        getEdges().then((edges) => {
            console.log(edges);
        });
    }, []);

    useEffect(() => {
        const testNodes: Node[] = [
            { id: '0', data: { label: 'Node 0' }, position: { x: 0, y: 0 } },
            { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
            { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 0 } },
            { id: '3', data: { label: 'Node 3' }, position: { x: 0, y: 0 } },
            { id: '4', data: { label: 'Node 4' }, position: { x: 0, y: 0 } },
            { id: '5', data: { label: 'Node 5' }, position: { x: 0, y: 0 } }
        ];
    
        const testEdges: Edge[] = [
            { id: 'e0-2', source: '0', target: '2', animated: true },
            { id: 'e1-2', source: '1', target: '2', animated: true },
            { id: 'e2-3', source: '2', target: '3', animated: true },
            { id: 'e2-4', source: '2', target: '4', animated: true },
            { id: 'e2-5', source: '2', target: '5', animated: true }
        ];
        const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
            const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
            g.setGraph({ rankdir: 'TB' });
    
            edges.forEach((edge: Edge) => g.setEdge(edge.source, edge.target));
            nodes.forEach((node: Node) => g.setNode(node.id, { label: node.data.label, width: 144, height: 44})); // totally arbitrary width and height
    
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
        const layoutedElements = getLayoutedElements(testNodes, testEdges);
        setNodes([...layoutedElements.nodes]);
        setEdges([...layoutedElements.edges]);
    }, []);

    return (
        // must be inside div
        <div style={{ width: '100%', height: '500px', border: 'solid 1px red', }}>
            <ReactFlow nodes={nodes} edges={edges} fitView />
        </div>
    )
};