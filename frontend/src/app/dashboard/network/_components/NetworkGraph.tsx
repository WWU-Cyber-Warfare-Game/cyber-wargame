import React, { useEffect, useState } from "react";
import ReactFlow from "reactflow";
import 'reactflow/dist/style.css';
import axios from "axios";

// fetches the data from strapi
const populateNetwork = async () => {
    try {
      // Make API request to fetch nodes
      const nodesResponse = await axios.get('STRAPI_NODES_API_ENDPOINT');
      const fetchedNodes = nodesResponse.data;
  
      // Make API request to fetch edges
      const edgesResponse = await axios.get('STRAPI_EDGES_API_ENDPOINT');
      const fetchedEdges = edgesResponse.data;
  
      return { nodes: fetchedNodes, edges: fetchedEdges };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { nodes: [], edges: [] };
    }
  };

// creates the networkGraph component
export default function NetworkGraph() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    // fetch the network from strapi
    useEffect(() => {
        const fetchData = async () => {
          const { nodes, edges } = await populateNetwork();
          setNodes(nodes);
          setEdges(edges);
        };
    
        fetchData();
    }, []);

    return (
        // must be inside div
        <div style={{ width: '100%', height: '500px', border: 'solid 1px red', }}>
            <ReactFlow nodes={nodes} edges={edges} fitView/>
        </div>
    )
};