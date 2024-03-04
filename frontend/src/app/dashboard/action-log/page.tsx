"use client";

import Link from "next/link";
import ActionLogFrame from "@/components/ActionLogFrame";

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

