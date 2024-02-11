import ChatFrame from "@/components/ChatFrame";

export default async function UserChatPage({ params }: { params: { slug: string } }) {
    return(
        <div>
            <p>Chatting with {params.slug}</p>
            <ChatFrame slug={params.slug} />
        </div>
    );
  }