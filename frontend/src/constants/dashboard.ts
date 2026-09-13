// Category Configuration
export const CATEGORY_CONFIG = {
  positive: {
    label: "😊 Positive Emotions",
    emoji: "😊",
    color: "#52B788",
  },
  neutral: {
    label: "😐 Neutral Emotions",
    emoji: "😐",
    color: "#4361EE",
  },
  negative: {
    label: "😔 Challenging Emotions",
    emoji: "😔",
    color: "#CC0000",
  },
} as const;

// UI Configuration
export const DASHBOARD_UI = {
  HEADER_HEIGHT: "256px",
  HEADER_HEIGHT_MD: "320px",
  PROFILE_IMAGE_SIZE: "128px",
  ADD_BUTTON_SIZE: "60px",
  ANIMATION_DURATION: "300ms",
  STAGGER_DELAY: "100ms",
} as const;

// Colors
export const COLORS = {
  PRIMARY: "#f782a9",
  SECONDARY: "#F9C5C7",
  TEXT_PRIMARY: "#1a1a1a",
  TEXT_SECONDARY: "#999",
  TEXT_MUTED: "#666",
  BG_LIGHT: "#fafafa",
  BG_WHITE: "#fff",
  BORDER_LIGHT: "#ddd",
  SHADOW_LIGHT: "rgba(0, 0, 0, 0.05)",
  SHADOW_MEDIUM: "rgba(0, 0, 0, 0.1)",
  SHADOW_COLOR: "rgba(247, 130, 169, 0.1)",
} as const;

// Date Format Options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
} as const;
