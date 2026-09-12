import { Mood } from "@/types/moods";

export type MoodCategory = "positive" | "neutral" | "negative";

/**
 * Organizes moods by category and sorts by name
 */
export function organizeMoodsByCategory(
  moods: Mood[],
): Record<MoodCategory, Mood[]> {
  const organized = moods.reduce(
    (acc, mood) => {
      if (!acc[mood.category]) {
        acc[mood.category] = [];
      }
      acc[mood.category].push(mood);
      return acc;
    },
    {} as Record<MoodCategory, Mood[]>,
  );

  // Sort each category alphabetically
  Object.keys(organized).forEach((cat) => {
    const category = cat as MoodCategory;
    organized[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  return organized;
}

/**
 * Finds a mood by name (case-insensitive)
 */
export function findMoodByName(moods: Mood[], name: string): Mood | undefined {
  return moods.find((m) => m.name.toLowerCase() === name.toLowerCase());
}

/**
 * Calculates word count from text
 */
export function calculateWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Formats current date for display
 */
export function formatCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Checks if entry is locked (published)
 */
export function isEntryLocked(isDraft: boolean): boolean {
  return !isDraft;
}
