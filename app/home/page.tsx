"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

interface UserProfile {
  name: string;
  email: string;
}

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setProfile({
        name: payload.name ?? payload.username ?? "User",
        email: payload.email ?? "—",
      });
    } catch {
      setProfile({ name: "User", email: "—" });
    }
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    router.replace("/login");
  }, [router]);

  if (!profile) {
    return (
      <main className={styles.page}>
        <div className={styles.loader} aria-label="Loading" />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <section className={styles.greeting} aria-labelledby="greeting-heading">
          <h1 id="greeting-heading" className={styles.hello}>
            Hello, {profile.name} 
          </h1>
          <p className={styles.sub}>Welcome back to your dashboard.</p>
        </section>

        <section className={styles.profile} aria-label="Profile information">
          <div className={styles.avatar} aria-hidden="true">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{profile.name}</p>
            <p className={styles.profileEmail}>{profile.email}</p>
          </div>
        </section>

        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          aria-label="Log out of your account"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
