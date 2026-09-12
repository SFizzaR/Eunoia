import { Mood } from "../types/moods";
import { MOOD_CATEGORY_LABELS, UI_CONFIG } from "../constants/constants";
import { LottieEmoji } from "./LottieEmoji";

interface MoodCategorySectionProps {
  category: "positive" | "neutral" | "negative";
  moods: Mood[];
  selectedMoods: string[];
  onToggleMood: (name: string) => void;
  isLocked: boolean;
}

/**
 * Renders a category of moods with toggle buttons
 */
export function MoodCategorySection({
  category,
  moods,
  selectedMoods,
  onToggleMood,
  isLocked,
}: MoodCategorySectionProps) {
  const categoryInfo = MOOD_CATEGORY_LABELS[category];

  if (moods.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: categoryInfo.color,
            margin: 0,
          }}
        >
          {categoryInfo.label}
        </h3>
        <span style={{ fontSize: "0.75rem", color: "#999" }}>
          ({moods.length})
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: UI_CONFIG.MOOD_GRID_COLUMNS,
          gap: "0.75rem",
          marginBottom: "0.5rem",
        }}
      >
        {moods.map((mood) => {
          const isSelected = selectedMoods.includes(mood.name);
          const borderColor = isSelected ? mood.color : "#ddd";
          const backgroundColor = isSelected ? `${mood.color}20` : "#fff";
          const textColor = isSelected ? mood.color : "#333";

          return (
            <button
              key={mood.id}
              onClick={() => onToggleMood(mood.name)}
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: `${isSelected ? "2px" : "1px"} solid ${borderColor}`,
                backgroundColor,
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.6 : 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease",
                fontSize: "0.875rem",
                fontWeight: isSelected ? "600" : "500",
                color: textColor,
              }}
              disabled={isLocked}
              title={mood.name}
              aria-pressed={isSelected}
              aria-label={`${mood.name}. ${isSelected ? "Selected" : "Not selected"}`}
            >
              <LottieEmoji
                animationUrl={mood.animatedEmojiUrl}
                size={UI_CONFIG.MOOD_EMOJI_SIZE}
                title={mood.name}
              />
              <span style={{ fontSize: "0.75rem" }}>{mood.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
