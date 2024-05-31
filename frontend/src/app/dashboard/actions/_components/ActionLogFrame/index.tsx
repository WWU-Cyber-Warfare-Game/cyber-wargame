"use client";

import { useState, useEffect } from "react";
import { ActionLog } from "@/types";
import Entry from "./Entry";
import { Socket } from "socket.io-client";
import styles from './actionlog.module.css';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface ActionLogFrameProps {
  readonly actionLog: ActionLog[];
}

/**
 * The action log frame for the application. Displays the action log.
 * @returns
 */
export default function ActionLogFrame({ actionLog }: Readonly<ActionLogFrameProps>) {
  return (
    <div className={styles.logCSS}>
      <h3>Log</h3>
      <ul>
        {actionLog.sort((a, b) => b.time.getTime() - a.time.getTime()).map((entry, index) => (
          <li key={index}>
            <Entry entry={entry} />
          </li>
        ))}
      </ul>
    </div>
  );
}
