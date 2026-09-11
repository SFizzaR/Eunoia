import styles from "../app/page.module.css";
import Mood from "./mood";
import { MoodData } from "@/types/moods";
import { fetchEmotions } from "../../hooks/useEmotions";
import { useState, useEffect } from "react";

export function MoodsSection() {
  const [moods, setMoods] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmotions()
      .then((data) => {
        // Validate each mood has required data
        const validMoods = data.filter((mood: MoodData) => {
          if (!mood.name || !mood.color || !mood.animatedEmojiUrl) {
            console.warn("Invalid mood data:", mood);
            return false;
          }
          return true;
        });
        setMoods(validMoods);
      })
      .catch((err) => {
        console.error("Failed to fetch moods:", err);
        setError("Failed to load moods");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading moods...</div>;
  if (error) return <div>{error}</div>;
  if (moods.length === 0) return <div>No moods available</div>;

  return (
    <section className={styles.moodsSection} id="Meet-the-moods">
      <div className={styles.moodsContainer}>
        <div className={styles.moodsHeader}>
          <h2 className={styles.sectionTitle}>Meet the Moods</h2>
          <p className={styles.sectionSubtitle}>
            Our model predicts your mood and breaks it down into four emotional
            states.
            <br />
            <span className={styles.subtitleAccent}>
              Understand yourself better, one journal entry at a time.
            </span>
          </p>
        </div>

        <div className={styles.moodsGrid}>
          {moods.map((moodData, index) => (
            <div
              key={moodData.name}
              className={styles.moodCardWrapper}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Mood
                name={moodData.name}
                color={moodData.color}
                animatedEmojiUrl={moodData.animatedEmojiUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
