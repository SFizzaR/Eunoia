import { useState, useCallback } from "react";
import { API_ENDPOINTS, ERROR_MESSAGES } from "../constants/constants";
import { fetchEmotions } from "../hooks/useEmotions";
import { UseMoodsReturn, Mood } from "@/types/moods";

export const useMoods = (): UseMoodsReturn => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [detectedMoods, setDetectedMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodDetectionError, setMoodDetectionError] = useState<string | null>(
    null,
  );

  const handleError = (err: unknown, defaultMessage: string) => {
    return err instanceof Error ? err.message : defaultMessage;
  };

  const fetchMoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmotions();
      setMoods(data);
    } catch (err) {
      setError(handleError(err, "Failed to load emotions"));
    } finally {
      setLoading(false);
    }
  }, []);

  const detectMoods = useCallback(
    async (
      content: string,
      entryId: number,
      token: string,
    ): Promise<string[]> => {
      try {
        setMoodDetectionError(null);

        const response = await fetch(API_ENDPOINTS.DETECT_MOOD, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            entryId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            ERROR_MESSAGES.MOOD_DETECTION_ERROR(
              errorData.message || response.statusText,
            ),
          );
        }

        const moodData = await response.json();
        const detectedEmotions = extractEmotionsFromResponse(moodData);

        if (detectedEmotions.length === 0) {
          console.warn("⚠️ No emotions extracted from mood detection response");
        }

        return detectedEmotions;
      } catch (err) {
        const errorMessage = handleError(
          err,
          ERROR_MESSAGES.MOOD_DETECTION_FAILED,
        );
        setMoodDetectionError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const toggleMood = useCallback((name: string) => {
    setSelectedMoods((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  }, []);

  const clearMoods = useCallback(() => {
    setSelectedMoods([]);
    setDetectedMoods([]);
  }, []);

  return {
    moods,
    selectedMoods,
    detectedMoods,
    loading,
    error,
    moodDetectionError,
    toggleMood,
    setSelectedMoods,
    setDetectedMoods,
    fetchMoods,
    detectMoods,
    clearMoods,
  };
};

/**
 * Extracts emotion names from various response formats
 * Handles both array and object responses from the API
 */
function extractEmotionsFromResponse(moodData: any): string[] {
  // Handle array response
  if (Array.isArray(moodData)) {
    return moodData
      .map((e: any) => e.emotionName || e.emotion || e.name || "")
      .filter(Boolean);
  }

  // Handle object with detectedEmotions array
  if (moodData.detectedEmotions && Array.isArray(moodData.detectedEmotions)) {
    return moodData.detectedEmotions
      .map((e: any) => e.emotionName || e.emotion || e.name || "")
      .filter(Boolean);
  }

  // Handle object with emotions array
  if (moodData.emotions && Array.isArray(moodData.emotions)) {
    return moodData.emotions
      .map((e: any) => e.emotionName || e.emotion || e.name || "")
      .filter(Boolean);
  }

  return [];
}
