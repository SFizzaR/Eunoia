"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Mood from "./components/mood";
import styles from "./page.module.css";

interface MoodData {
  mood: string;
  color: string;
  filepath: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleGetStarted = () => {
    router.push("/Auth/Register");
  };

  const moods: MoodData[] = [
    {
      mood: "Happy",
      color: "#fff8d1ff",
      filepath: "/happy.json",
      description: "You're glowing today! Keep spreading the positivity.",
    },
    {
      mood: "Sad",
      color: "#d3ddfc",
      filepath: "/sad.json",
      description: "It's okay to feel low. We'll help you find comfort.",
    },
    {
      mood: "Angry",
      color: "#fad8d8ff",
      filepath: "/angry.json",
      description:
        "Take a deep breath. Let's find a way to release the tension.",
    },
    {
      mood: "Stressed",
      color: "#f6d4faff",
      filepath: "/stress.json",
      description: "Pause, slow down, and give yourself a moment to recharge.",
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section
        className={`${styles.heroSection} ${isLoaded ? styles.loaded : ""}`}
      >
        <div className={styles.heroImageWrapper}>
          <Image
            src="/bg.jpg"
            alt="cherry blossom background"
            fill
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroTextGroup}>
            <Image
              src="/eunoia.png"
              alt="Eunoia Logo"
              width={800}
              height={400}
            />
            <p className={styles.pronunciation}>"you-noh-ya"</p>
            <p className={styles.tagline}>
              Beautiful thinking, beautifully tracked
            </p>
          </div>

          <button
            className={styles.ctaButton}
            onClick={handleGetStarted}
            aria-label="Get started with Eunoia"
          >
            <span>Get Started</span>
            <svg
              className={styles.arrowIcon}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M7 10H13M13 10L10 7M13 10L10 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Meet the Moods Section */}
      <section className={styles.moodsSection} id="Meet-the-moods">
        <div className={styles.moodsContainer}>
          <div className={styles.moodsHeader}>
            <h2 className={styles.sectionTitle}>Meet the Moods</h2>
            <p className={styles.sectionSubtitle}>
              Our model predicts your mood and breaks it down into four
              emotional states.
              <br />
              <span className={styles.subtitleAccent}>
                Understand yourself better, one journal entry at a time.
              </span>
            </p>
          </div>

          <div className={styles.moodsGrid}>
            {moods.map((moodData, index) => (
              <div
                key={moodData.mood}
                className={styles.moodCardWrapper}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Mood
                  mood={moodData.mood}
                  color={moodData.color}
                  filepath={moodData.filepath}
                  description={moodData.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
