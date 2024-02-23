"use client";

import { useState, useEffect } from "react";
import { getActionLog } from "@/actions";
import { ActionLog } from "@/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export default function ActionLogPage() {
  const [actionLogData, setActionLogData] = useState<ActionLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getActionLog();
        setActionLogData(data);
      } catch (error) {
        console.error('Error fetching action log data:', error);
      }
    };

    fetchData();
  }, []);
  return (
    <div>      
        <h3>Actions:</h3>
        <ul>
          {actionLogData.map((action) => (
            <li>
            Action Name: {action.name}, 
            Duration: {action.duration}, 
            Description: {action.description}, 
            Role: {action.teamRole}
            </li>
          ))}
        </ul>
    </div>
  );
}
