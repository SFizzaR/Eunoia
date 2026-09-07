"use client";
import { useLottie } from "lottie-react";
import { useEffect, useState } from "react";
import styles from "./Mood.module.css";
import { MoodData } from "@/types/moods";

export default function Mood({ name, color, animatedEmojiUrl }: MoodData) {
  const [emoji, setEmoji] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(animatedEmojiUrl)
      .then((res) => res.json())
      .then((json) => {
        setEmoji(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading animation:", err);
        setIsLoading(false);
      });
  }, [animatedEmojiUrl]);

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
        <h3 className={styles.moodName}>{name}</h3>
      </div>

      <div className={styles.moodFooter}>
        <span className={styles.badge}>{name}</span>
      </div>

      <div className={styles.hoverEffect}></div>
    </article>
  );
}
