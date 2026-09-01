// hooks/useTokenExpiration.ts
import { useEffect } from "react";
import { logout, isTokenExpired } from "../lib/auth";

export const useTokenExpiration = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Check immediately
    if (isTokenExpired(token)) {
      logout();
      return;
    }

    // Set up interval to check periodically (every 30 seconds)
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken || isTokenExpired(currentToken)) {
        logout();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);
};
