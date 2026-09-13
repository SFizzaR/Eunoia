"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useTokenExpiration } from "../../hooks/useTokenExpiration";
import { useJournalEntry } from "../../hooks/useJournalEntry";
import { useAttachments } from "../../hooks/useAttachments";
import { useMoods } from "../../hooks/useMoods";
import { useReflection } from "../../hooks/useReflection";
import { API_BASE_URL } from "../../constants/journal";
import {
  buildEmotionsArray,
  extractUserSelectedEmotions,
  extractAIDetectedEmotions,
} from "../../utils/emotionUtils";
import {
  organizeMoodsByCategory,
  formatCurrentDate,
  isEntryLocked,
  calculateWordCount,
} from "../../utils/moodUtils";
import { JournalEditor } from "../../components/JournalEditor";
import { ActionButtons } from "../../components/ActionButtons";
import { ReflectionSection } from "../../components/ReflectionSection";
import { MoodCategorySection } from "../../components/MoodCategorySection";
import { AttachmentList } from "../../components/AttachmentList";
import styles from "./journal.module.css";

/**
 * Main Journal Component - Refactored for clean code principles
 *
 * This component has been refactored to follow:
 * - Single Responsibility Principle (each piece has one job)
 * - DRY (Don't Repeat Yourself) - logic extracted to hooks and utils
 * - Separation of Concerns (UI, API, state management)
 * - Clear naming and organization
 */
export default function Journal() {
  useTokenExpiration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams?.get("id");

  // State management via custom hooks
  const {
    loading: moodsLoading,
    error: moodsError,
    moods,
    selectedMoods,
    detectedMoods,
    toggleMood,
    setSelectedMoods,
    setDetectedMoods,
    fetchMoods,
    detectMoods: detectMoodsAPI,
  } = useMoods();

  const {
    loading: entryLoading,
    error: entryError,
    saving,
    saveError,
    saveSuccess,
    deleteError,
    deleteSuccess,
    fetchEntry,
    saveDraft,
    publishEntry,
    deleteEntry,
  } = useJournalEntry();

  const {
    attachments,
    uploadingFile,
    uploadError,
    deleteError: attachmentDeleteError,
    fetchAttachments,
    uploadFiles,
    deleteAttachment,
  } = useAttachments();

  const {
    generatedReflection,
    reflectionLoading,
    reflectionError,
    showReflection,
    fetchExistingReflection,
    generateReflection,
  } = useReflection();

  // Local UI state
  const [thoughts, setThoughts] = useState("");
  const [draftEntryId, setDraftEntryId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isLocked = draftEntryId ? isEntryLocked(!entryLoading) : false;
  const wordCount = calculateWordCount(thoughts);
  const now = formatCurrentDate();

  // Initialize token from localStorage
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // Fetch moods on mount
  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  // Load existing entry if editing
  useEffect(() => {
    if (!entryId || !token) return;

    const loadEntry = async () => {
      try {
        // Make single fetch call to load entry
        const response = await fetch(`${API_BASE_URL}/entries/${entryId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          console.error("Unauthorized - please log in again");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load entry: ${response.status}`);
        }

        const data = await response.json();

        // Populate form with entry data
        setThoughts(data.content || "");
        setDraftEntryId(data.id);

        // Load emotions (user-selected and AI-detected)
        if (data.emotions && Array.isArray(data.emotions)) {
          setSelectedMoods(extractUserSelectedEmotions(data.emotions));
          setDetectedMoods(extractAIDetectedEmotions(data.emotions));
        }

        // Load related data in parallel
        await Promise.all([
          fetchAttachments(data.id, token),
          fetchExistingReflection(data.id, token),
        ]);
      } catch (err) {
        console.error("❌ Error loading entry:", err);
      }
    };

    loadEntry();
  }, [entryId, token, fetchAttachments, fetchExistingReflection]);

  // Handle saving as draft
  const handleSaveDraft = async () => {
    if (!token) return;

    const newEntryId = await saveDraft(
      thoughts,
      buildEmotionsArray(selectedMoods, detectedMoods, moods),
      draftEntryId,
      token,
    );
    if (newEntryId) {
      setDraftEntryId(newEntryId);
      if (!draftEntryId) {
        await fetchAttachments(newEntryId, token);
      }
    }
  };

  // Handle publishing entry
  const handlePublishEntry = async () => {
    if (!token) return;

    await publishEntry(
      thoughts,
      buildEmotionsArray(selectedMoods, detectedMoods, moods),
      draftEntryId,
      token,
    );
  };

  // Handle generating reflection
  const handleGenerateReflection = async () => {
    if (!token || !draftEntryId) return;

    try {
      // Save draft first if not saved
      let currentEntryId = draftEntryId;
      if (!currentEntryId) {
        currentEntryId =
          (await saveDraft(
            thoughts,
            buildEmotionsArray(selectedMoods, detectedMoods, moods),
            null,
            token,
          )) || 0;
        if (!currentEntryId) return;
        setDraftEntryId(currentEntryId);
      }

      // Detect moods
      const detected = await detectMoodsAPI(thoughts, currentEntryId, token);
      setDetectedMoods(detected);

      // Generate reflection
      const emotionsForReflection = buildEmotionsArray(
        selectedMoods,
        detected,
        moods,
      );
      const emotionNames = emotionsForReflection
        .map((e) => {
          const mood = moods.find((m) => m.id === e.emotionId);
          return mood?.name || "";
        })
        .filter(Boolean);

      await generateReflection(currentEntryId, thoughts, emotionNames, token);
    } catch (error) {
      console.error("Error in reflection flow:", error);
    }
  };

  // Handle deleting entry
  const handleDeleteEntry = async () => {
    if (!token || !draftEntryId) return;

    await deleteEntry(draftEntryId, token);

    // Clear form and redirect
    setThoughts("");
    setSelectedMoods([]);
    setDetectedMoods([]);
    setDraftEntryId(null);

    setTimeout(() => router.push("/Dashboard"), 1000);
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!token || !draftEntryId) return;
    await uploadFiles(files, draftEntryId, token);
  };

  // Loading state
  if (entryLoading) {
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

        {/* Error States */}
        {entryError && (
          <div className={styles.errorContainer} role="alert">
            <p className={styles.errorText}>Error: {entryError}</p>
          </div>
        )}

        {reflectionError && (
          <div className={styles.errorContainer} role="alert">
            <p className={styles.errorText}>Error: {reflectionError}</p>
          </div>
        )}

        {/* Mood Selection Section */}
        <section className={styles.moodSection}>
          <h2>How are you feeling today?</h2>

          {moodsLoading && (
            <div className={styles.loadingContainer}>
              <p className={styles.loadingText}>Loading emotions...</p>
            </div>
          )}

          {moodsError && (
            <div className={styles.errorContainer} role="alert">
              <p className={styles.errorText}>
                Error loading emotions: {moodsError}
              </p>
            </div>
          )}

          {!moodsLoading && !moodsError && moods.length > 0 && (
            <>
              {(() => {
                const organized = organizeMoodsByCategory(moods);
                return (
                  <>
                    {(["positive", "neutral", "negative"] as const).map(
                      (category) =>
                        organized[category]?.length > 0 && (
                          <MoodCategorySection
                            key={category}
                            category={category}
                            moods={organized[category]}
                            selectedMoods={selectedMoods}
                            onToggleMood={toggleMood}
                            isLocked={isLocked}
                          />
                        ),
                    )}
                  </>
                );
              })()}

              {selectedMoods.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <button
                    className={styles.skipMood}
                    onClick={() => setSelectedMoods([])}
                    disabled={isLocked}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </>
          )}

          {!moodsLoading && !moodsError && moods.length === 0 && (
            <p className={styles.emptyState}>No emotions available</p>
          )}
        </section>

        {/* Journal Editor */}
        <JournalEditor
          thoughts={thoughts}
          onThoughtsChange={setThoughts}
          onFileUpload={handleFileUpload}
          uploadError={uploadError}
          deleteError={attachmentDeleteError}
          uploadingFile={uploadingFile}
          isLocked={isLocked}
          hasEntry={!!draftEntryId}
          wordCount={wordCount}
        />

        {/* Attachments List */}
        {draftEntryId && (
          <AttachmentList
            attachments={attachments}
            entryId={draftEntryId}
            token={token || ""}
            onDeleteSuccess={deleteAttachment}
            disabled={isLocked}
          />
        )}

        {/* Messages */}
        {saveError && (
          <div className={styles.saveMessage} data-type="error" role="alert">
            ❌ {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className={styles.saveMessage} data-type="success" role="status">
            ✅ Entry saved successfully!
          </div>
        )}

        {deleteSuccess && (
          <div className={styles.saveMessage} data-type="success" role="status">
            ✅ Entry deleted successfully!
          </div>
        )}

        {/* Action Buttons */}
        <ActionButtons
          saving={saving}
          reflectionLoading={reflectionLoading}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublishEntry}
          onReflect={handleGenerateReflection}
          onDelete={handleDeleteEntry}
          hasContent={thoughts.trim().length > 0}
          hasEntry={!!draftEntryId}
          isLocked={isLocked}
        />

        {/* Reflection Section */}
        <ReflectionSection
          show={showReflection}
          reflectionLoading={reflectionLoading}
          generatedReflection={generatedReflection}
          detectedMoods={detectedMoods}
          moods={moods}
          isLocked={isLocked}
          onRegenerateReflection={() => {
            generateReflection(draftEntryId!, thoughts, detectedMoods, token!);
          }}
          onGenerateNewReflection={handleGenerateReflection}
        />
      </main>
    </div>
  );
}
