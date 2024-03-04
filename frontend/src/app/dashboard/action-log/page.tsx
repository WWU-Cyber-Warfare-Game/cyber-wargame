"use client";
import { io } from "socket.io-client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getActionLog } from "@/actions";
import { ActionLog } from "@/types";
import ActionLogPage from "@/components/ActionLogFrame";

export default async function DisplayActionLogPage() {
  
  return (
    <div>
      <h2>Action Log</h2>
      <p>Welcome to Action Log test page.</p>
      <Link href="/dashboard/chat">Go to chat</Link>
      <br />
      <Link href="/dashboard">Go to Dashboard</Link>
      <ActionLogPage/>
   </div>   
  );
}

