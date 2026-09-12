export interface Emotion {
  emotionId: string;
  emotionName: string;
  animatedEmojiUrl: string;
  entryCount: number;
  color: string;
  category: "positive" | "neutral" | "negative";
}

export interface CategorizedEmotions {
  positive: Emotion[];
  neutral: Emotion[];
  negative: Emotion[];
}
