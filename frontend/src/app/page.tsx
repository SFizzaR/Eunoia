"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { HeroSection } from "@/components/HeroSection";
import { MoodsSection } from "@/components/MoodsSection";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/Auth/Register");
  };

  return (
    <div className={styles.container}>
      <HeroSection onGetStarted={handleGetStarted} />
      <MoodsSection></MoodsSection>
    </div>
  );
}
