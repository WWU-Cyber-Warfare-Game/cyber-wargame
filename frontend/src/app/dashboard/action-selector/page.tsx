
import Link from "next/link";
import { ActionSelectorFrame } from "@/components/ActionSelectorFrame";

export default function ActionSelectorPage() {
  
  return (
    <div>
      <h2>Action Selector</h2>
      <Link href="/dashboard/chat">Go to Chat</Link>
      <br />
      <Link href="/dashboard">Go to Dashboard</Link>
      <br />
      <Link href="/dashboard/action-log">Go to Action Log</Link>
      <ActionSelectorFrame />
   </div>   
  );
}
