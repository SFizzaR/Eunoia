"use client";
import { useLottie } from "lottie-react";
import { useEffect, useState } from "react";
import styles from "./Mood.module.css";

interface MoodProps {
  mood: string;
  color: string;
  filepath: string;
  description: string;
}

export default function Mood({
  mood,
  color,
  filepath,
  description,
}: MoodProps) {
  const [emoji, setEmoji] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(filepath)
      .then((res) => res.json())
      .then((json) => {
        setEmoji(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading animation:", err);
        setIsLoading(false);
      });
  }, [filepath]);

  const { View } = useLottie({
    animationData: emoji,
    loop: true,
  });

  return (
    <article
      className={styles.moodCard}
      style={{ "--mood-color": color } as any}
    >
      <div className={styles.emojiContainer}>
        {isLoading ? <div className={styles.emojiSkeleton}></div> : View}
      </div>

      <div className={styles.moodHeader}>
        <h3 className={styles.moodName}>{mood}</h3>
      </div>

      <p className={styles.moodDescription}>{description}</p>

      <div className={styles.moodFooter}>
        <span className={styles.badge}>{mood}</span>
      </div>

      <div className={styles.hoverEffect}></div>
    </article>
  );
}
