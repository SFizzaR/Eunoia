export interface MoodData {
  name: string;
  color: string;
  animatedEmojiUrl: string;
}
export interface MoodEmojiProps {
  animatedEmojiUrl: string;
  size?: number;
}

export interface Mood {
  id: string;
  name: string;
  animatedEmojiUrl: string;
  category: "positive" | "neutral" | "negative";
  color: string;
}

export interface UseMoodsReturn {
  moods: Mood[];
  selectedMoods: string[];
  detectedMoods: string[];
  loading: boolean;
  error: string | null;
  moodDetectionError: string | null;
  toggleMood: (name: string) => void;
  setSelectedMoods: (moods: string[]) => void;
  setDetectedMoods: (moods: string[]) => void;
  fetchMoods: () => Promise<void>;
  detectMoods: (
    content: string,
    entryId: number,
    token: string,
  ) => Promise<string[]>;
  clearMoods: () => void;
}

export interface MoodCategorySectionProps {
  category: "positive" | "neutral" | "negative";
  moods: Mood[];
  selectedMoods: string[];
  onToggleMood: (name: string) => void;
  isLocked: boolean;
}
