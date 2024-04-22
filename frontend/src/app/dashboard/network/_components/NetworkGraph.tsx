import React, { useEffect, useState } from "react";
import ReactFlow from "reactflow";
import 'reactflow/dist/style.css';
// import { populateNetwork } from "@/actions";

// creates the networkGraph component
export default function NetworkGraph() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    // fetch the network from strapi
    // useEffect(() => {
    //     const fetchData = async () => {
    //       const { nodes, edges } = await populateNetwork();
    //     //   setNodes(nodes);
    //     //   setEdges(edges);
    //     };
    
    //     fetchData();
    // }, []);

    return (
        // must be inside div
        <div style={{ width: '100%', height: '500px', border: 'solid 1px red', }}>
            <ReactFlow nodes={nodes} edges={edges} fitView/>
        </div>
    )
};