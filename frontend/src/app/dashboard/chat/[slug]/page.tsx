import { getUser } from "@/actions";

export default async function UserChatPage({ params }: { params: { slug: string } }) {
    return(
        <div>
            <p>Chatting with {params.slug}</p>
        </div>
    );
  }