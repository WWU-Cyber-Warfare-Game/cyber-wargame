"use client";
import { io } from "socket.io-client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getActionLog } from "@/actions";
import { ActionLog } from "@/types";

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
      <h2>Action Log</h2>
      <p>Welcome to Action Log test page.</p>
      <Link href="/dashboard/chat">Go to chat</Link>
      <br />
      <Link href="/dashboard">Go to Dashboard</Link>
      
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
    </div>
  );
}

