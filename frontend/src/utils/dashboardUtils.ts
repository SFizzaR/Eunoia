import { CATEGORY_CONFIG, DATE_FORMAT_OPTIONS } from "../constants/dashboard";
import { Emotion, CategorizedEmotions } from "../types/dashboard";

/**
 * Format current date for display
 */
export function formatCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
}

/**
 * Get category configuration by category name
 */
export function getCategoryConfig(category: keyof typeof CATEGORY_CONFIG) {
  return CATEGORY_CONFIG[category];
}

/**
 * Filter emotions by entry count (only show emotions with entries)
 */
export function filterEmotionsWithEntries(emotions: Emotion[]): Emotion[] {
  return emotions.filter((emotion) => emotion.entryCount > 0);
}

/**
 * Organize emotions into categories
 */
export function organizeEmotionsByCategory(
  emotions: Emotion[],
): CategorizedEmotions {
  const organized: CategorizedEmotions = {
    positive: [],
    neutral: [],
    negative: [],
  };

  emotions.forEach((emotion) => {
    const category = emotion.category || "neutral";
    if (category in organized) {
      organized[category as keyof CategorizedEmotions].push(emotion);
    }
  });

  return organized;
}

/**
 * Check if there are any emotions to display
 */
export function hasEmotions(categorized: CategorizedEmotions): boolean {
  return (
    categorized.positive.length > 0 ||
    categorized.neutral.length > 0 ||
    categorized.negative.length > 0
  );
}

/**
 * Get total emotion count
 */
export function getTotalEmotionCount(categorized: CategorizedEmotions): number {
  return (
    categorized.positive.length +
    categorized.neutral.length +
    categorized.negative.length
  );
}

/**
 * Load user data from localStorage
 */
export function loadUserData(key: "user"): any | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Extract user info from stored data
 */
export function extractUserInfo(userData: any) {
  return {
    firstName: userData?.firstname || "User",
    profileImage: userData?.profileImageUrl || null,
    coverImage: userData?.coverImageUrl || null,
  };
}

/**
 * Format entry statistics
 */
export function formatEntryStats(
  published: number,
  drafts: number,
): { published: number; drafts: number } {
  return { published, drafts };
}
