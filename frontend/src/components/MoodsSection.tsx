import styles from "../app/page.module.css";
import Mood from "./mood";
import { MoodData } from "@/types/moods";
import { fetchEmotions } from "../../hooks/useEmotions";
import { useState, useEffect } from "react";
export function MoodsSection() {
  const [moods, setMoods] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmotions()
      .then(setMoods)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading moods...</div>;
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
