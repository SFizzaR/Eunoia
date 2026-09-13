import { useState, useCallback } from "react";
import { logout } from "../lib/auth";
import { CategorizedEmotions, Emotion } from "../types/dashboard";
import { UseDashboardDataReturn } from "../types/dashboard";

/**
 * Hook for fetching dashboard data including entry counts and emotions
 */
export const useDashboardData = (): UseDashboardDataReturn => {
  const [categorizedEmotions, setCategorizedEmotions] =
    useState<CategorizedEmotions>({
      positive: [],
      neutral: [],
      negative: [],
    });
  const [draftCount, setDraftCount] = useState(0);
  const [totalPublishedEntries, setTotalPublishedEntries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3000/entries/count", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();

      // Categorize emotions by their category field
      const organized: CategorizedEmotions = {
        positive: [],
        neutral: [],
        negative: [],
      };

      data.emotions.forEach((emotion: Emotion) => {
        const category = emotion.category || "neutral";
        if (category in organized) {
          organized[category as keyof CategorizedEmotions].push(emotion);
        }
      });

      setCategorizedEmotions(organized);
      setDraftCount(data.draftCount);
      setTotalPublishedEntries(data.totalPublishedEntries);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categorizedEmotions,
    draftCount,
    totalPublishedEntries,
    loading,
    error,
    fetchDashboardData,
  };
};
