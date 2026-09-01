"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Paperclip, Sparkles, Lock } from "lucide-react";
import styles from "./journal.module.css";
import { AttachmentList } from "../components/Attachmentlist";
import { useTokenExpiration } from "../../../hooks/useTokenExpiration";
import { logout } from "../../../lib/auth";

interface Mood {
  id: string;
  name: string;
  emoji: string;
}

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export default function Journal() {
  useTokenExpiration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams?.get("id");

  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState("");
  const [showReflection, setShowReflection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftEntryId, setDraftEntryId] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setdeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Only runs on client-side
    setToken(localStorage.getItem("token"));
  }, []);

  // ✅ Fetch existing entry if entryId is provided
  useEffect(() => {
    const fetchExistingEntry = async () => {
      if (!entryId || !token) return;

      try {
        setLoadingEntry(true);
        setError(null);

        const response = await fetch(
          `http://localhost:3000/entries/${entryId}`,
          {
            method: "GET",
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
          throw new Error("Failed to load entry");
        }

        const data = await response.json();

        // Populate form with existing entry data
        setThoughts(data.content || "");
        setDraftEntryId(data.id);
        setIsPublished(!data.isDraft);

        // Load selected moods
        if (data.emotions && Array.isArray(data.emotions)) {
          const moodNames = data.emotions
            .map((e: any) => e.emotion?.name || "")
            .filter(Boolean);
          setSelectedMoods(moodNames);
        }

        // Fetch attachments for this entry
        await fetchAttachments(data.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entry");
        console.error("Error loading entry:", err);
      } finally {
        setLoadingEntry(false);
      }
    };

    fetchExistingEntry();
  }, [entryId, token]);

  // ✅ Toggle mood selection (add/remove)
  const toggleMood = (name: string) => {
    setSelectedMoods((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  };

  // ✅ Fetch attachments for current entry
  const fetchAttachments = async (id: number | string) => {
    try {
      setLoadingAttachments(true);
      const response = await fetch(`http://localhost:3000/attachments/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      // 404 means no attachments (empty is ok)
      if (response.status === 404) {
        setAttachments([]);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAttachments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching attachments:", err);
      // Don't show error - attachments are optional
    } finally {
      setLoadingAttachments(false);
    }
  };

  // ✅ Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!draftEntryId) {
      setUploadError("Please save as draft first before adding attachments");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    try {
      setUploadingFile(true);
      setUploadError(null);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        `http://localhost:3000/attachments/${draftEntryId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      // Refresh attachments list
      await fetchAttachments(draftEntryId);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload attachment",
      );
      console.error("Upload error:", err);
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClickAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input ref is null!");
    }
  };

  // ✅ Handle attachment deletion
  const handleDeleteAttachment = (attachmentId: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry? This action cannot be undone.",
    );

    if (!confirmed) return;

    if (!draftEntryId) {
      setdeleteError("No entry to delete");
      return;
    }

    try {
      setSaving(true);
      setdeleteError(null);

      const res = await fetch(`http://localhost:3000/entries/${draftEntryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete entry");
      }

      // Success! Clear everything and redirect
      setDeleteSuccess(true);
      setThoughts("");
      setSelectedMoods([]);
      setAttachments([]);
      setDraftEntryId(null);
      setIsPublished(false);

      // Redirect back to entries after 1 second
      setTimeout(() => {
        router.push("/Journal/entries");
      }, 1000);
    } catch (error) {
      setdeleteError(
        error instanceof Error ? error.message : "Failed to delete entry",
      );
      console.error("Delete error:", error);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Save entry as draft
  const saveDraft = async () => {
    if (!thoughts.trim()) {
      setSaveError("Please write something before saving");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      const method = draftEntryId ? "PATCH" : "POST";
      const url = draftEntryId
        ? `http://localhost:3000/entries/${draftEntryId}`
        : "http://localhost:3000/entries";
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: thoughts,
          IsDraft: true,
          emotionids: selectedMoods
            .map((name) => moods.find((m) => m.name === name)?.id)
            .filter(Boolean),
        }),
      });
      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }
      const data = await response.json();
      setDraftEntryId(data.id);
      setSaveSuccess(true);

      // Fetch attachments if this is a new entry
      if (!draftEntryId) {
        await fetchAttachments(data.id);
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Publish entry
  const publishEntry = async () => {
    if (!thoughts.trim()) {
      setSaveError("Please write something before publishing");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      const method = draftEntryId ? "PATCH" : "POST";
      const url = draftEntryId
        ? `http://localhost:3000/entries/${draftEntryId}`
        : "http://localhost:3000/entries";
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: thoughts,
          IsDraft: false,
          emotionids: selectedMoods
            .map((name) => moods.find((m) => m.name === name)?.id)
            .filter(Boolean),
        }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to publish entry");
      }
      setSaveSuccess(true);
      setIsPublished(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to publish entry",
      );
    } finally {
      setSaving(false);
    }
  };

  // ✅ Fetch emotions from backend
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:3000/emotions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch emotions");
        }

        const data = await response.json();
        setMoods(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching emotions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, []);

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const wordCount = thoughts.trim() ? thoughts.trim().split(/\s+/).length : 0;
  const isLocked = isPublished;

  if (loadingEntry) {
    return (
      <div className={styles.journalContainer}>
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <p className={styles.loadingText}>Loading entry...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.journalContainer}>
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.date}>{now}</p>

            <h1>{entryId ? "Edit Entry" : "Today's Thoughts"}</h1>

            <p className={styles.subtitle}>
              {entryId
                ? "Update your thoughts and feelings"
                : "This is your space. Write freely, without judgment."}
            </p>
          </div>

          <div className={styles.privateBadge}>
            <Lock size={14} />
            Private journal
            {isLocked && (
              <span style={{ marginLeft: "8px" }}>🔒 Published</span>
            )}
          </div>
        </header>
        {isLocked && (
          <div className={styles.lockedWarning}>
            <Lock size={16} />
            This entry has been published and cannot be edited.
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>Error: {error}</p>
          </div>
        )}

        {/* Mood Section */}
        <section className={styles.moodSection}>
          <h2>How are you feeling today?</h2>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingContainer}>
              <p className={styles.loadingText}>Loading emotions...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>
                Error loading emotions: {error}
              </p>
            </div>
          )}

          {/* Mood Options */}
          {!loading && !error && (
            <>
              <div className={styles.moodOptions}>
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => toggleMood(mood.name)}
                    className={`${styles.moodCard} ${
                      selectedMoods.includes(mood.name)
                        ? styles.selectedMood
                        : ""
                    }`}
                    aria-pressed={selectedMoods.includes(mood.name)}
                    disabled={isLocked}
                  >
                    <span className={styles.moodEmoji}>{mood.emoji}</span>
                    <span>{mood.name}</span>
                  </button>
                ))}
              </div>

              {selectedMoods.length > 0 && (
                <div className={styles.selectedMoodsDisplay}>
                  <p className={styles.selectedMoodsLabel}>Selected moods:</p>
                  <div className={styles.moodTags}>
                    {selectedMoods.map((mood) => {
                      const moodObj = moods.find((m) => m.name === mood);
                      return (
                        <div key={mood} className={styles.moodTag}>
                          <span>{moodObj?.emoji}</span>
                          <span>{mood}</span>
                          <button
                            className={styles.removeMoodTag}
                            onClick={() => toggleMood(mood)}
                            aria-label={`Remove ${mood}`}
                            disabled={isLocked}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                className={styles.skipMood}
                onClick={() => setSelectedMoods([])}
                disabled={isLocked}
              >
                Clear all
              </button>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && moods.length === 0 && (
            <p className={styles.emptyState}>No emotions available</p>
          )}
        </section>

        {/* Journal Paper */}
        <section className={styles.editorSection}>
          <div className={styles.editorTop}>
            <div>
              <h2>What's on your mind?</h2>
              <p>There are no wrong things to write here.</p>
            </div>
          </div>

          <div className={styles.paper}>
            <textarea
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="Dear journal..."
              aria-label="Journal entry"
              disabled={isLocked}
            />

            <div className={styles.paperFooter}>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <button
                  className={styles.attachmentButton}
                  disabled={isLocked || uploadingFile}
                  onClick={handleClickAttachment}
                  title={
                    !draftEntryId
                      ? "Save as draft first to add attachments"
                      : isLocked
                        ? "Published entries cannot be edited"
                        : "Add attachment"
                  }
                >
                  <Paperclip size={17} />
                  {uploadingFile ? "Uploading..." : "Add attachment"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept="image/*,audio/*,.pdf"
                  disabled={uploadingFile}
                />
                {uploadError && (
                  <span style={{ color: "#d32f2f", fontSize: "0.875rem" }}>
                    {uploadError}
                  </span>
                )}
                {deleteError && (
                  <span style={{ color: "#d32f2f", fontSize: "0.875rem" }}>
                    {deleteError}
                  </span>
                )}
              </div>

              <span>{wordCount} words</span>
            </div>
          </div>
        </section>

        {/* Attachments List */}
        {draftEntryId && (
          <AttachmentList
            attachments={attachments}
            entryId={draftEntryId}
            token={token || ""}
            onDeleteSuccess={handleDeleteAttachment}
            disabled={isLocked}
          />
        )}

        {/* Save/Error Messages */}
        {saveError && (
          <div className={styles.saveMessage} data-type="error">
            ❌ {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className={styles.saveMessage} data-type="success">
            ✅ Entry saved successfully!
          </div>
        )}

        {deleteSuccess && (
          <div className={styles.saveMessage} data-type="success">
            ✅ Entry deleted successfully!
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.draftButton}
            onClick={saveDraft}
            disabled={saving || !thoughts.trim() || isLocked}
            title={isLocked ? "Published entries cannot be edited" : ""}
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>

          <button
            className={styles.publishButton}
            onClick={publishEntry}
            disabled={saving || !thoughts.trim() || isLocked}
            title={isLocked ? "Entry already published" : ""}
          >
            {saving ? "Publishing..." : "Publish Entry"}
          </button>

          <button
            className={styles.reflectButton}
            onClick={() => setShowReflection(true)}
            disabled={!thoughts.trim() || isLocked}
            title={
              !thoughts.trim()
                ? "Write something first"
                : isLocked
                  ? "Published entries cannot be reflected on"
                  : ""
            }
          >
            <Sparkles size={18} />
            Reflect on this
          </button>

          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={!draftEntryId}
            title={!draftEntryId ? "Entry must be saved first" : ""}
          >
            Delete
          </button>
        </div>

        {/* AI Reflection */}
        {showReflection && (
          <section className={styles.reflection}>
            <div className={styles.reflectionHeader}>
              <div className={styles.sparkle}>
                <Sparkles size={20} />
              </div>

              <div>
                <h2>A little reflection</h2>
                <p>Here's what I noticed in your entry.</p>
              </div>
            </div>

            <div className={styles.detectedMood}>
              <div className={styles.detectedMoodEmojis}>
                {selectedMoods.length > 0 ? (
                  selectedMoods.map((mood) => {
                    const moodObj = moods.find((m) => m.name === mood);
                    return (
                      <span key={mood} className={styles.detectedMoodEmoji}>
                        {moodObj?.emoji}
                      </span>
                    );
                  })
                ) : (
                  <span className={styles.detectedMoodEmoji}>💭</span>
                )}
              </div>

              <div>
                <p>Your entry seems to reflect</p>
                <strong>
                  {selectedMoods.length > 0
                    ? selectedMoods.join(", ")
                    : "some thoughts or feelings"}
                </strong>
              </div>
            </div>

            <p className={styles.reflectionText}>
              It sounds like you have a lot on your mind right now. You don't
              have to figure everything out at once. Taking a small break or
              talking to someone you trust might help.
            </p>

            <p className={styles.aiDisclaimer}>
              This is a reflection, not a diagnosis.
            </p>

            <div className={styles.reflectionActions}>
              <button onClick={() => setShowReflection(false)}>
                That feels right
              </button>
              <button onClick={() => setShowReflection(false)}>
                Not quite
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
