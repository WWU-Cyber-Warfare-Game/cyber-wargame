import Link from "next/link";

export default async function ChatLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div>
            <h2>Chat Page</h2>
            <Link href="/dashboard">Back to dashboard</Link>
            {children}
        </div>
    );
  }