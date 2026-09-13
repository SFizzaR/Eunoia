import { useState, useCallback } from "react";
import { UseReflectionReturn, ReflectionData } from "@/types/reflection";

export const useReflection = (): UseReflectionReturn => {
  const [generatedReflection, setGeneratedReflection] =
    useState<ReflectionData | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);

  const handleError = (err: unknown, defaultMessage: string) => {
    return err instanceof Error ? err.message : defaultMessage;
  };

  const fetchExistingReflection = useCallback(
    async (entryId: number | string, token: string) => {
      try {
        const response = await fetch(
          `http://localhost:3000/entries/${entryId}/reflections`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const reflectionData = await response.json();
          const reflectionObject = extractReflectionData(reflectionData);
          setGeneratedReflection(reflectionObject);
          setShowReflection(true);
        }
      } catch (err) {
        console.log("No existing reflection found (this is ok)");
      }
    },
    [],
  );

  const generateReflection = useCallback(
    async (
      entryId: number,
      content: string,
      emotions: string[],
      token: string,
    ) => {
      if (!content.trim()) {
        setReflectionError("Content cannot be empty.");
        return;
      }

      try {
        setReflectionLoading(true);
        setReflectionError(null);

        const response = await fetch(
          `http://localhost:3000/entries/${entryId}/reflections`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              entryId,
              content,
              emotions,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            handleError(
              errorData.message || response.statusText,
              "Failed to generate reflection",
            ),
          );
        }

        const data = await response.json();
        const reflectionObject = extractReflectionData(data);

        setGeneratedReflection(reflectionObject);
        setShowReflection(true);
      } catch (error) {
        const errorMessage = handleError(
          error,
          "Failed to generate reflection",
        );
        setReflectionError(errorMessage);
        console.error("Error generating reflection:", error);
      } finally {
        setReflectionLoading(false);
      }
    },
    [],
  );

  const clearReflection = useCallback(() => {
    setGeneratedReflection(null);
    setShowReflection(false);
    setReflectionError(null);
  }, []);

  return {
    generatedReflection,
    reflectionLoading,
    reflectionError,
    showReflection,
    setShowReflection,
    fetchExistingReflection,
    generateReflection,
    clearReflection,
  };
};

function extractReflectionData(data: any): ReflectionData {
  // Handle nested structure: data.reflectionData.reflection
  const actualData = data.reflectionData || data;

  return {
    reflection: actualData.reflection || "",
    advice: actualData.advice || null,
  };
}
