import styles from "../app/page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className={styles.heroSection}>
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
          <Image src="/eunoia.png" alt="Eunoia Logo" width={800} height={400} />
          <p className={styles.pronunciation}>"you-noh-ya"</p>
          <p className={styles.tagline}>
            Beautiful thinking, beautifully tracked
          </p>
        </div>

        <button
          className={styles.ctaButton}
          onClick={onGetStarted}
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
  );
}
