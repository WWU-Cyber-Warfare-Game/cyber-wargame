"use client";

import { useState, useEffect } from "react";
import { getActionLog } from "@/actions";
import { ActionLog } from "@/types";
import Entry from "./Entry";
import { Socket } from "socket.io-client";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface ActionLogFrameProps {
  readonly socket: Socket | null;
}

/**
 * The action log frame for the application. Displays the action log.
 * @returns
 */
export default function ActionLogFrame({ socket }: Readonly<ActionLogFrameProps>) {
  const [actionLogData, setActionLogData] = useState<ActionLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function refreshActionLog() {
    getActionLog().then((actionLogData) => {
      if (actionLogData) {
        setActionLogData(actionLogData);
        setLoading(false);
      } else {
        setError("Error fetching action log");
      }
    });
  }

  useEffect(() => {
    refreshActionLog();
  }, []);

  useEffect(() => {
    if (socket) socket.on('actionComplete', () => refreshActionLog());
    if (socket) socket.on('connect', () => refreshActionLog());
  }, [socket])

  return (
    <div>
      <h3>Log</h3>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {actionLogData.sort((a, b) => b.time.getTime() - a.time.getTime()).map((actionLog, index) => (
          <li key={index}>
            <Entry entry={actionLog} />
          </li>
        ))}
      </ul>
    </div>
  );
}
