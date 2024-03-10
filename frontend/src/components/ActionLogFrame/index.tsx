"use client";

import { useState, useEffect } from "react";
import { getActionLog } from "@/actions";
import { ActionLog } from "@/types";
import Entry from "./Entry";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export default function ActionLogFrame() {
  const [actionLogData, setActionLogData] = useState<ActionLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActionLog().then((actionLogData) => {
      if (actionLogData) {
        setActionLogData(actionLogData);
        setLoading(false);
      } else {
        setError("Error fetching action log");
      }
    });
  }, []);
  return (
    <div>      
        <h3>Actions:</h3>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        <ul>
          {actionLogData.map((actionLog, index) => (
            <li key={index}>
              <Entry entry={actionLog} />
            </li>
          ))}
        </ul>
    </div>
  );
}
