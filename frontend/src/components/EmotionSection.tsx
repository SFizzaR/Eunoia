import { EmotionCard } from "./EmotionCard";
import { EmotionSectionProps } from "../types/dashboard";

export function EmotionSection({
  title,
  color,
  emotions,
  isLoaded,
  onViewEmotion,
}: EmotionSectionProps) {
  const emotionsWithEntries = emotions.filter(
    (emotion) => emotion.entryCount > 0,
  );

  if (emotionsWithEntries.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <h2
        className="text-2xl font-bold mb-6"
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: color,
        }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {emotionsWithEntries.map((emotion, index) => (
          <EmotionCard
            key={emotion.emotionId}
            emotion={emotion}
            index={index}
            isLoaded={isLoaded}
            onViewEmotion={onViewEmotion}
          />
        ))}
      </div>
    </div>
  );
}
