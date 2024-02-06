import { validateUser } from "@/actions";
import { redirect } from "next/navigation";

export default async function TeamChatPage () {
    const user = await validateUser();
    if (!user) {
        redirect("/login");
    }
    
    return <div>
        <p>Chatting with {user.team.name}</p>
    </div>
}