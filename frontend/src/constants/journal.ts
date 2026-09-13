// UI Configuration
export const UI_CONFIG = {
  MESSAGE_DISPLAY_TIME: 3000, // 3 seconds
  REDIRECT_DELAY: 1000, // 1 second
  MOOD_GRID_COLUMNS: "repeat(auto-fill, minmax(90px, 1fr))",
  MOOD_EMOJI_SIZE: 40,
  DETECTED_MOOD_EMOJI_SIZE: 50,
} as const;

// Mood Categories
export const MOOD_CATEGORIES = {
  POSITIVE: "positive" as const,
  NEUTRAL: "neutral" as const,
  NEGATIVE: "negative" as const,
} as const;

export const MOOD_CATEGORY_LABELS = {
  positive: {
    label: "😊 Positive Emotions",
    color: "#52B788",
  },
  neutral: {
    label: "😐 Neutral Emotions",
    color: "#4361EE",
  },
  negative: {
    label: "😔 Challenging Emotions",
    color: "#CC0000",
  },
} as const;

// File Upload
export const UPLOAD_CONFIG = {
  ACCEPTED_TYPES: "image/*,audio/*,.pdf",
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Headers
export const getAuthHeaders = (token: string | null) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});
