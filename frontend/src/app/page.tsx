import Link from "next/link";
import styles from "./Home.module.css";
import { validateUser } from "@/actions";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await validateUser(cookies().get("jwt")?.value);

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
