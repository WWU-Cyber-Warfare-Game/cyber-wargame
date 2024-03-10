"use client";

import Link from "next/link";
import ActionLogFrame from "@/components/ActionLogFrame";

/**
 * The action log page for the application. Displays all of the actions that have been performed in the game.
 * @returns 
 */
export default function ActionLogPage() {
  
  return (
    <div>
      <h2>Action Log</h2>
      <Link href="/dashboard/chat">Go to Chat</Link>
      <br />
      <Link href="/dashboard">Go to Dashboard</Link>
      <ActionLogFrame />
   </div>   
  );
}

