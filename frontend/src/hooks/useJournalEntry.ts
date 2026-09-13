import { useState, useCallback } from "react";
import { logout } from "../lib/auth";
import {
  JournalEntryData,
  UseJournalEntryReturn,
  EmotionData,
} from "@/types/journal";

export const useJournalEntry = (): UseJournalEntryReturn => {
  const [entry, setEntry] = useState<JournalEntryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleError = (err: unknown, defaultMessage: string) => {
    return err instanceof Error ? err.message : defaultMessage;
  };

  const clearMessages = useCallback(() => {
    setSaveError(null);
    setSaveSuccess(false);
    setDeleteError(null);
    setDeleteSuccess(false);
  }, []);

  const fetchEntry = useCallback(async (entryId: string, token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/entries/${entryId}`, {
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
        throw new Error("Failed to fetch journal entry");
      }

      const data = await response.json();
      setEntry(data);
    } catch (err) {
      setError(handleError(err, "Failed to fetch journal entry"));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDraft = useCallback(
    async (
      content: string,
      emotions: EmotionData[],
      entryId: number | null,
      token: string,
    ): Promise<number | null> => {
      if (!content.trim()) {
        setSaveError("Content cannot be empty.");
        setTimeout(() => setSaveError(null), 3000);
        return null;
      }

      try {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const method = entryId ? "PATCH" : "POST";
        const url = entryId
          ? `http://localhost:3000/entries/${entryId}`
          : `http://localhost:3000/entries`;

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            IsDraft: true,
            emotions,
          }),
        });

        if (response.status === 401) {
          logout();
          return null;
        }

        if (!response.ok) {
          throw new Error("Failed to save draft");
        }

        const data = await response.json();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        return data.id;
      } catch (err) {
        setSaveError(handleError(err, "Failed to save draft"));
        return null;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const publishEntry = useCallback(
    async (
      content: string,
      emotions: EmotionData[],
      entryId: number | null,
      token: string,
    ): Promise<void> => {
      if (!content.trim()) {
        setSaveError("Content cannot be empty.");
        setTimeout(() => setSaveError(null), 3000);
        return;
      }

      try {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        if (!entryId) {
          // Create new published entry
          const response = await fetch(`http://localhost:3000/entries`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content,
              IsDraft: false,
              emotions,
            }),
          });

          if (response.status === 401) {
            logout();
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to publish entry");
          }

          const data = await response.json();
          setEntry({ ...data, isDraft: false });
        } else {
          // Update existing entry to published
          const response = await fetch(
            `http://localhost:3000/entries/${entryId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                content,
                IsDraft: false,
              }),
            },
          );

          if (response.status === 401) {
            logout();
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to publish entry");
          }

          setEntry((prev) => (prev ? { ...prev, isDraft: false } : null));
        }

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        setSaveError(handleError(err, "Failed to publish entry"));
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteEntry = useCallback(
    async (entryId: number, token: string): Promise<void> => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this entry? This action cannot be undone.",
      );

      if (!confirmed) return;

      try {
        setSaving(true);
        setDeleteError(null);

        const response = await fetch(
          `http://localhost:3000/entries/${entryId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to delete entry");
        }

        setDeleteSuccess(true);
        setEntry(null);
        setTimeout(() => setDeleteSuccess(false), 3000);
      } catch (err) {
        setDeleteError(handleError(err, "Failed to delete entry"));
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    saving,
    saveError,
    saveSuccess,
    deleteError,
    deleteSuccess,
    entry,
    fetchEntry,
    saveDraft,
    publishEntry,
    deleteEntry,
    clearMessages,
  };
};
