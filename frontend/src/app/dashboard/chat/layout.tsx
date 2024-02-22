import Link from "next/link";

/**
 * The layout for the chat page. Displays a header and a link back to the dashboard.
 * @param children 
 * @returns 
 */
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