import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { validateUser } from "@/actions";

export const metadata: Metadata = {
  title: "Cyber Wargame",
  description: "A cyber wargame strategy game.",
};

/**
 * The root layout for the application. This layout includes a header with a link to the home page and a message indicating whether the user is logged in.
 * @param children The children of the layout
 * @returns 
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await validateUser();

  return (
    <html lang="en">
      <body>
        <Link href="/"><h1>Cyber Wargame</h1></Link>
        <>
          {user ? (
            <p>Welcome, {user.username}! <Link href={"/logout"}>Log out?</Link></p>
          ) : (
            <p>You are not currently logged in.</p>
          )}
        </>
        {children}
      </body>
    </html>
  );
}
