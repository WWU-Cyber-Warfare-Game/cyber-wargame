import Link from "next/link";
import styles from "./Home.module.css";
import { validateUser } from "@/actions";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation'

/**
 * The home page for the application. Only displays if the user is not logged in, otherwise redirects to the dashboard.
 * @returns 
 */
export default async function Home() {
  const user = await validateUser();

  if (user) {
    redirect('/dashboard')
  } else {
    return (
      <main>
        <div id={styles.main}>
          <Link href="/login">Log In</Link>
          <Link href="/signup">Sign Up</Link>
        </div>
      </main>
    );
  }
}
