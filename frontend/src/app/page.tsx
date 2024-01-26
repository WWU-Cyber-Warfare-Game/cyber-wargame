import Link from "next/link";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <main id={styles.main}>
      <Link href="/login">Log In</Link>
      <Link href="/signup">Sign Up</Link>
    </main>
  );
}
