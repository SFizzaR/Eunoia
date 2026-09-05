import styles from "../app/page.module.css";
import { moods } from "@/constants/moods";
import Mood from "./mood";

export function MoodsSection() {
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
  );
}
