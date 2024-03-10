
import Link from "next/link";
import { ActionSelectorFrame } from "@/components/ActionSelectorFrame";
import { validateUser } from "@/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; 

export default async function ActionSelectorPage() {
  const user = await validateUser();
  const jwt = cookies().get("jwt")?.value;
  if (!user || !jwt) {
    redirect("/login");
  }

  
  return (
    <div>
      <h2>Action Selector</h2>
      <Link href="/dashboard/chat">Go to Chat</Link>
      <br />
      <Link href="/dashboard">Go to Dashboard</Link>
      <br />
      <Link href="/dashboard/action-log">Go to Action Log</Link>
      <ActionSelectorFrame user={user} jwt={jwt} />
   </div>   
  );
}
