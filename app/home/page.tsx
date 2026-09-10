"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

const API_BASE = "https://protective-freedom-production-1d23.up.railway.app";

interface UserProfile {
  name: string;
  email: string;
}

interface ApiProfileData {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
}

interface ApiResponse {
  success?: boolean;
  profile?: ApiProfileData;
  message?: string;
}

type ProfileState = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiProfile, setApiProfile] = useState<ApiProfileData | null>(null);
  const [profileState, setProfileState] = useState<ProfileState>("idle");
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const handleCheckProfile = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Session expired. Please log in again.");
      router.replace("/login");
      return;
    }

    setProfileState("loading");

    try {
      const response = await fetch(`${API_BASE}/api/profile`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});


      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        // Token invalid / expired / unauthorized
        setProfileState("error");
        alert(data.message ?? "Session is invalid or expired. Please log in again.");
        localStorage.removeItem("authToken");
        router.replace("/login");
        return;
      }

      setApiProfile(data.profile ?? null);
      setProfileState("success");
      setShowProfileModal(true);
    } catch {
      setProfileState("error");
      alert("Network error. Please check your connection.");
    }
  }, [router]);

  const handleCloseModal = useCallback(() => {
    setShowProfileModal(false);
    setProfileState("idle");
  }, []);

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
          onClick={handleCheckProfile}
          disabled={profileState === "loading"}
          className={styles.profileBtn}
          aria-label="Check your profile"
        >
          {profileState === "loading" ? (
            <>
              <span className={styles.btnSpinner} aria-hidden="true" />
              Checking…
            </>
          ) : (
            "View Profile"
          )}
        </button>

        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          aria-label="Log out of your account"
        >
          Log out
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && apiProfile && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleCloseModal}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="modal-title" className={styles.modalTitle}>
                Your Profile
              </h2>
              <button
                onClick={handleCloseModal}
                className={styles.modalClose}
                aria-label="Close profile"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalAvatar} aria-hidden="true">
              {(apiProfile.name ?? apiProfile.username ?? "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className={styles.modalInfo}>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Name</span>
                <span className={styles.modalValue}>
                  {apiProfile.name ?? apiProfile.username ?? "—"}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Email</span>
                <span className={styles.modalValue}>
                  {apiProfile.email ?? "—"}
                </span>
              </div>
           
            </div>

            <button
              onClick={handleCloseModal}
              className={styles.modalDismiss}
              aria-label="Dismiss profile"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
