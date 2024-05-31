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
        getGraphData().then((data) => {
            if (!data) return;
            setTeamGraph(data.teamGraph);
            setOpponentGraph(data.opponentGraph);
        });
    }, []);

    return(
        <div className={styles.networkContainer}>
            {target === "team" ? <h3>Team Network</h3> : <h3>Opponent Network</h3>}
            <button className={styles.switchTeam} onClick={switchTeams}>Switch teams</button>
            <NetworkGraph target={target} graph={target === "team" ? teamGraph : opponentGraph} />
        </div>
    );
}