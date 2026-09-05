"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName?: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string = "",
  ) => {
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          firstname: firstName,
          lastname: lastName,
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error(data.error || "Signup failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.access_token) {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/Auth/Login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        login,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
