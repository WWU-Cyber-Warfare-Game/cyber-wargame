import ChatFrame from "@/components/ChatFrame";
import { validateUser } from "@/actions";
import { redirect } from "next/navigation";

export default async function UserChatPage({ params }: { params: { slug: string } }) {
    const user = await validateUser();
    if (!user) {
        redirect("/login");
    }
    
    return(
        <div>
            <p>Chatting with {params.slug}</p>
            <ChatFrame sender={user?.username} receiver={params.slug} />
        </div>
    );
  }