import ChatFrame from "@/components/ChatFrame";
import { getUser, validateUser } from "@/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * The chat page between two users.
 * @param params The parameters for the page. Contains the slug of the user to chat with. 
 * @returns 
 */
export default async function UserChatPage({ params }: { params: { slug: string } }) {
    const user = await validateUser();
    const jwt = cookies().get("jwt")?.value
    
    // check if user is logged in, if not redirect to login page
    if (!user || !jwt) {
        redirect("/login");
    }

    // check if the user to chat with exists and is on the same team
    const receiver = await getUser(params.slug);
    if (!receiver || receiver.username === user.username || !receiver.team || receiver.team !== user.team) {
        redirect("/dashboard/chat");
    }
    
    return(
        <div>
            <p>Chatting with {params.slug}</p>
            <ChatFrame sender={user.username} receiver={params.slug} jwt={jwt} />
        </div>
    );
  }