import { useState, useCallback } from "react";
import { API_ENDPOINTS, ERROR_MESSAGES } from "../constants/journal";
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

      const response = await fetch(`${API_ENDPOINTS.ENTRIES}/${entryId}`, {
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
        throw new Error(ERROR_MESSAGES.FETCH_FAILED);
      }

      const data = await response.json();
      setEntry(data);
    } catch (err) {
      setError(handleError(err, ERROR_MESSAGES.FETCH_FAILED));
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
        setSaveError(ERROR_MESSAGES.EMPTY_CONTENT);
        setTimeout(() => setSaveError(null), 3000);
        return null;
      }

      try {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const method = entryId ? "PATCH" : "POST";
        const url = entryId
          ? `${API_ENDPOINTS.ENTRIES}/${entryId}`
          : API_ENDPOINTS.ENTRIES;

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
          throw new Error(ERROR_MESSAGES.SAVE_DRAFT_FAILED);
        }

        const data = await response.json();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        return data.id;
      } catch (err) {
        setSaveError(handleError(err, ERROR_MESSAGES.SAVE_DRAFT_FAILED));
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
        setSaveError(ERROR_MESSAGES.EMPTY_CONTENT);
        setTimeout(() => setSaveError(null), 3000);
        return;
      }

      try {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        if (!entryId) {
          // Create new published entry
          const response = await fetch(API_ENDPOINTS.ENTRIES, {
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
            throw new Error(ERROR_MESSAGES.PUBLISH_FAILED);
          }

          const data = await response.json();
          setEntry({ ...data, isDraft: false });
        } else {
          // Update existing entry to published
          const response = await fetch(`${API_ENDPOINTS.ENTRIES}/${entryId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content,
              IsDraft: false,
            }),
          });

          if (response.status === 401) {
            logout();
            return;
          }

          if (!response.ok) {
            throw new Error(ERROR_MESSAGES.PUBLISH_FAILED);
          }

          setEntry((prev) => (prev ? { ...prev, isDraft: false } : null));
        }

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        setSaveError(handleError(err, ERROR_MESSAGES.PUBLISH_FAILED));
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

        const response = await fetch(`${API_ENDPOINTS.ENTRIES}/${entryId}`, {
          method: "DELETE",
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
          throw new Error(ERROR_MESSAGES.DELETE_FAILED);
        }

        setDeleteSuccess(true);
        setEntry(null);
        setTimeout(() => setDeleteSuccess(false), 3000);
      } catch (err) {
        setDeleteError(handleError(err, ERROR_MESSAGES.DELETE_FAILED));
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
