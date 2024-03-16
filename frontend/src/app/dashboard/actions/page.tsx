import Link from "next/link";
import ActionLogFrame from "@/components/ActionLogFrame";
import ActionSelectorFrame from "@/components/ActionSelectorFrame";
import { validateUser } from "@/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * The action page for the application. Displays the action log and the action selector.
 * @returns 
 */
export default async function ActionPage() {
    const user = await validateUser();
    const jwt = cookies().get("jwt")?.value;
    if (!user || !jwt) {
        redirect("/login");
    }

    return (
        <div>
            <h2>Action Log</h2>
            <Link href="/dashboard/chat">Go to Chat</Link>
            <br />
            <Link href="/dashboard">Go to Dashboard</Link>
            <br />
            <ActionSelectorFrame user={user} jwt={jwt} />
            <ActionLogFrame />
        </div>
    );
}