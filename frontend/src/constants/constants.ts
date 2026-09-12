// API Configuration
export const API_BASE_URL = "http://localhost:3000";

export const API_ENDPOINTS = {
  ENTRIES: `${API_BASE_URL}/entries`,
  ATTACHMENTS: (entryId: number | string) =>
    `${API_BASE_URL}/attachments/${entryId}`,
  ENTRY_REFLECTIONS: `${API_BASE_URL}/entry-reflections`,
  ENTRY_REFLECTIONS_BY_ID: (entryId: number | string) =>
    `${API_BASE_URL}/entry-reflections/${entryId}`,
  DETECT_MOOD: `${API_BASE_URL}/entry-emotions/detect-mood`,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  EMPTY_CONTENT: "Please write something before saving",
  SAVE_DRAFT_FAILED: "Failed to save draft",
  PUBLISH_FAILED: "Failed to publish entry",
  DELETE_FAILED: "Failed to delete entry",
  UPLOAD_FAILED: "Failed to upload attachment",
  FETCH_FAILED: "Failed to load entry",
  REFLECTION_FAILED: "Failed to generate reflection",
  MOOD_DETECTION_FAILED: "Failed to detect mood",
  NO_DRAFT_FOR_ATTACHMENTS:
    "Please save as draft first before adding attachments",
  NO_ENTRY_TO_DELETE: "No entry to delete",
  MOOD_DETECTION_ERROR: (message: string) =>
    `Failed to detect mood: ${message}`,
  REFLECTION_ERROR: (message: string) =>
    `Failed to generate reflection: ${message}`,
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: "Entry saved successfully!",
  PUBLISHED: "Entry published successfully!",
  DELETED: "Entry deleted successfully!",
  UPLOADED: "Attachment uploaded successfully!",
} as const;

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
