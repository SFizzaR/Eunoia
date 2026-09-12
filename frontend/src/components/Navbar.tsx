"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/Dashboard");
    } else {
      router.push("/Auth/Register");
    }
  };

  const handleHome = () => {
    if (isAuthenticated) {
      router.push("/Dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Left: Logo */}
        <div className={styles.logoSection}>
          <button
            className={styles.logo}
            onClick={handleHome}
            aria-label="Eunoia home"
          >
            <img
              src="/logo.png"
              alt="Eunoia Logo"
              className={styles.logoImage}
            />
            <span className={styles.brandName}>Eunoia</span>
          </button>
        </div>

        {/* Center: Navigation Links */}
        <div className={styles.navLinks}>
          {isAuthenticated && (
            <>
              <button
                className={styles.link}
                onClick={() => router.push("/Dashboard")}
              >
                Dashboard
              </button>
              <button
                className={styles.link}
                onClick={() => router.push("/Journal")}
              >
                Journal
              </button>
              <button
                className={styles.link}
                onClick={() => router.push("/Settings")}
              >
                Settings
              </button>
            </>
          )}
        </div>

        {/* Right: Auth Buttons */}
        <div className={styles.authSection}>
          {isAuthenticated ? (
            <>
              <button className={styles.logoutButton} onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className={styles.getStartedButton}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
