import { Mood } from "../types/moods";
import { EmotionData } from "../types/journal";

/**
 * Builds a unified emotions array from selected and AI-detected moods
 */
export function buildEmotionsArray(
  selectedMoods: string[],
  detectedMoods: string[],
  allMoods: Mood[],
): EmotionData[] {
  const emotionsArray: EmotionData[] = [];

  // Add user-selected emotions
  selectedMoods.forEach((moodName) => {
    const mood = allMoods.find((m) => m.name === moodName);
    if (mood) {
      emotionsArray.push({
        emotionId: mood.id,
        userSelected: true,
        aiDetected: false,
      });
    }
  });

  // Add AI-detected emotions (only if not already selected by user)
  detectedMoods.forEach((moodName) => {
    const mood = allMoods.find(
      (m) => m.name.toLowerCase() === moodName.toLowerCase(),
    );
    if (mood && !selectedMoods.includes(mood.name)) {
      emotionsArray.push({
        emotionId: mood.id,
        userSelected: false,
        aiDetected: true,
        confidence: 0.8,
      });
    }
  });

  return emotionsArray;
}

/**
 * Extracts user-selected emotions from entry data
 */
export function extractUserSelectedEmotions(emotionsData: any[]): string[] {
  return emotionsData
    .filter((e: any) => e.userSelected)
    .map((e: any) => e.emotion?.name || "")
    .filter(Boolean);
}

/**
 * Extracts AI-detected emotions from entry data
 */
export function extractAIDetectedEmotions(emotionsData: any[]): string[] {
  return emotionsData
    .filter((e: any) => e.aiDetected)
    .map((e: any) => e.emotion?.name || "")
    .filter(Boolean);
}
