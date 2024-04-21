import React from "react";
import ReactFlow, { EdgeLabelRenderer } from "reactflow";
import 'reactflow/dist/style.css';

export default function NetworkGraph() {

    const initialNodes = [
        {id: '1', position: {x: 0, y: 0}, data: {label: 'node 1'}},
        {id: '2', position: {x: 0, y: 100}, data: {label: 'node 2'}}
    ];
    const initialEdges = [{id: 'edge 1-2', source: '1', target: '2'}];

    return (
        // must be inside div
        <div style={{ width: '100%', height: '500px', border: 'solid 1px red', }}>
            <ReactFlow nodes={initialNodes} edges={initialEdges} fitView/>
        </div>
    )
};