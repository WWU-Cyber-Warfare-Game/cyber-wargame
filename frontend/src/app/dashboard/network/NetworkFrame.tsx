"use client";
import styles from "./_components/Network.module.css";
import NetworkGraph from "./_components/NetworkGraph";

export default function NetworkFrame() {
    return(

        <div className={styles.networkContainer}>
            <text>This is the network</text>
            <NetworkGraph></NetworkGraph>
        </div>
    );
}