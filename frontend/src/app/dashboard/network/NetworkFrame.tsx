"use client";
import styles from "./_components/Network.module.css";
import NetworkGraph from "./_components/NetworkGraph";
import { useState, useEffect } from "react";
import { Graph, Target } from "@/types";
import { getActionPageData, getGraphData } from "@/actions";

export default function NetworkFrame() {
    const [target, setTarget] = useState<Target>("team");
    const [teamGraph, setTeamGraph] = useState<Graph>({ nodes: [], edges: [] });
    const [opponentGraph, setOpponentGraph] = useState<Graph>({ nodes: [], edges: [] });

    function switchTeams() {
        if (target === "team") {
            setTarget("opponent");
        } else {
            setTarget("team");
        }
    }

    useEffect(() => {
        getGraphData("team").then((graph) => {
            if (graph === null) {
                console.error("Error: graph is null");
                return;
            }
            setTeamGraph(graph);
        });
        getGraphData("opponent").then((graph) => {
            if (graph === null) {
                console.error("Error: graph is null");
                return;
            }
            setOpponentGraph(graph);
        });
    }, []);

    // for testing, remove
    useEffect(() => {
        getActionPageData().then((data) => {
            console.log(data);
        });
    }, [])

    return(
        <div className={styles.networkContainer}>
            {target === "team" ? <h3>Team Network</h3> : <h3>Opponent Network</h3>}
            <button onClick={switchTeams}>Switch teams</button>
            <NetworkGraph target={target} graph={target === "team" ? teamGraph : opponentGraph} />
        </div>
    );
}