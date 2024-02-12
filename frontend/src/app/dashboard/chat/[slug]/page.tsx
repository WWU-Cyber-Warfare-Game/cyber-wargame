import ChatFrame from "@/components/ChatFrame";
import { getUser, validateUser } from "@/actions";
import { redirect } from "next/navigation";

export default async function UserChatPage({ params }: { params: { slug: string } }) {
    const user = await validateUser();
    if (!user) {
        redirect("/login");
    }

    const receiver = await getUser(params.slug);
    if (!receiver || receiver.username === user.username || !receiver.team || receiver.team !== user.team) {
        redirect("/dashboard/chat");
    }
    
    return(
        <div>
            <p>Chatting with {params.slug}</p>
            <ChatFrame sender={user.username} receiver={params.slug} />
        </div>
    );
  }