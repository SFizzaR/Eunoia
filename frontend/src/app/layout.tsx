// app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eunoia - Beautiful Thinking",
  description: "A mood-aware journaling app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
