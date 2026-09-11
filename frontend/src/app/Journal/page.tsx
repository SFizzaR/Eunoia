"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Paperclip, Sparkles, Lock } from "lucide-react";
import styles from "./journal.module.css";
import { AttachmentList } from "../components/Attachmentlist";
import { useTokenExpiration } from "../../../hooks/useTokenExpiration";
import { logout } from "../../../lib/auth";
import { fetchEmotions } from "../../../hooks/useEmotions";
import { Attachment } from "@/types/attachment";
import { MoodEmoji } from "@/components/MoodEmoji";
import { Loader } from "lucide-react";
import Lottie from "lottie-react"; // ← Import Lottie

interface Mood {
  id: string;
  name: string;
  animatedEmojiUrl: string;
  category: "positive" | "neutral" | "negative";
  color: string;
}
const organizeMoodsByCategory = (moods: Mood[]) => {
  const organized = moods.reduce(
    (acc, mood) => {
      if (!acc[mood.category]) {
        acc[mood.category] = [];
      }
      acc[mood.category].push(mood);
      return acc;
    },
    {} as Record<"positive" | "neutral" | "negative", Mood[]>,
  );

  // Sort each category by name
  Object.keys(organized).forEach((cat) => {
    organized[cat as "positive" | "neutral" | "negative"].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  return organized;
};

// Component for rendering Lottie animations
const LottieEmoji = ({
  animationUrl,
  size = 40,
}: {
  animationUrl: string;
  size?: number;
}) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(animationUrl);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Error loading Lottie animation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimation();
  }, [animationUrl]);

  if (loading) {
    return <div style={{ width: size, height: size, background: "#f0f0f0" }} />;
  }

  if (!animationData) {
    return (
      <div style={{ width: size, height: size, background: "#ddd" }}>❌</div>
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop
      style={{ width: size, height: size }}
    />
  );
};

// Component for category sections
const MoodCategorySection = ({
  category,
  moods,
  selectedMoods,
  onToggleMood,
  isLocked,
}: {
  category: "positive" | "neutral" | "negative";
  moods: Mood[];
  selectedMoods: string[];
  onToggleMood: (name: string) => void;
  isLocked: boolean;
}) => {
  const categoryLabels = {
    positive: {
      label: "😊 Positive Emotions",
      color: "#52B788",
    },
    neutral: {
      label: "😐 Neutral Emotions",
      color: "#4361EE",
    },
    negative: {
      label: "😔 Challenging Emotions",
      color: "#CC0000",
    },
  };

  const categoryInfo = categoryLabels[category];

  if (moods.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: categoryInfo.color,
            margin: 0,
          }}
        >
          {categoryInfo.label}
        </h3>
        <span style={{ fontSize: "0.75rem", color: "#999" }}>
          ({moods.length})
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: "0.75rem",
          marginBottom: "0.5rem",
        }}
      >
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onToggleMood(mood.name)}
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: selectedMoods.includes(mood.name)
                ? `2px solid ${mood.color}`
                : "1px solid #ddd",
              backgroundColor: selectedMoods.includes(mood.name)
                ? `${mood.color}20`
                : "#fff",
              cursor: isLocked ? "not-allowed" : "pointer",
              opacity: isLocked ? 0.6 : 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
              fontSize: "0.875rem",
              fontWeight: selectedMoods.includes(mood.name) ? "600" : "500",
              color: selectedMoods.includes(mood.name) ? mood.color : "#333",
            }}
            disabled={isLocked}
            title={mood.name}
          >
            <LottieEmoji animationUrl={mood.animatedEmojiUrl} size={40} />
            <span style={{ fontSize: "0.75rem" }}>{mood.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

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
  const [detectedMoods, setDetectedMoods] = useState<string[]>([]);
  const [generatedReflection, setGeneratedReflection] = useState<{
    reflection: string;
    advice: string | null;
  } | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  useEffect(() => {
    // Only runs on client-side
    setToken(localStorage.getItem("token"));
  }, []);

  // Fetch existing entry if entryId is provided
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
          const userSelectedMoods = data.emotions
            .filter((e: any) => e.userSelected) // ← Only user-selected
            .map((e: any) => e.emotion?.name || "")
            .filter(Boolean);
          setSelectedMoods(userSelectedMoods);

          // Load AI-detected moods
          const aiDetectedMoods = data.emotions
            .filter((e: any) => e.aiDetected) // ← Only AI-detected
            .map((e: any) => e.emotion?.name || "")
            .filter(Boolean);
          setDetectedMoods(aiDetectedMoods);
          console.log("✅ AI detected moods on load:", aiDetectedMoods);
        }

        // Fetch attachments for this entry
        await fetchAttachments(data.id);

        // Fetch existing reflection if it exists
        try {
          const reflectionResponse = await fetch(
            `http://localhost:3000/entry-reflections/${data.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (reflectionResponse.ok) {
            const reflectionData = await reflectionResponse.json();
            console.log("✅ Found existing reflection:", reflectionData);
            setGeneratedReflection(reflectionData);
            setShowReflection(true); // Auto-show the reflection
          }
        } catch (err) {
          console.log("No reflection found (this is ok)");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entry");
        console.error("Error loading entry:", err);
      } finally {
        setLoadingEntry(false);
      }
    };

    fetchExistingEntry();
  }, [entryId, token]);

  const buildEmotionsArray = () => {
    const emotionsArray: Array<{
      emotionId: string;
      userSelected: boolean;
      aiDetected: boolean;
      confidence?: number;
    }> = [];

    // Add user-selected emotions
    selectedMoods.forEach((moodName) => {
      const mood = moods.find((m) => m.name === moodName);
      if (mood) {
        emotionsArray.push({
          emotionId: mood.id,
          userSelected: true,
          aiDetected: false,
        });
      }
    });

    // Add AI-detected emotions
    detectedMoods.forEach((moodName) => {
      const mood = moods.find((m) => m.name === moodName);
      if (mood) {
        emotionsArray.push({
          emotionId: mood.id,
          userSelected: false,
          aiDetected: true,
          confidence: 0.8,
        });
      }
    });

    return emotionsArray;
  };

  // Toggle mood selection (add/remove)
  const toggleMood = (name: string) => {
    setSelectedMoods((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  };

  // Fetch attachments for current entry
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

  // Handle file upload
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

  // Handle attachment deletion
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

      const response = await fetch(
        `http://localhost:3000/entries/${draftEntryId}`,
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

      // Success! Clear everything and redirect
      setDeleteSuccess(true);
      setThoughts("");
      setSelectedMoods([]);
      setAttachments([]);
      setDraftEntryId(null);
      setIsPublished(false);

      // Redirect back to entries after 1 second
      setTimeout(() => {
        router.push("/Dashboard");
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

  // Save entry as draft
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

      // Build unified emotions array
      const emotionsArray = buildEmotionsArray();

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: thoughts,
          IsDraft: true,
          emotions: emotionsArray, // Send unified emotions array
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

  // Publish entry
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

      // ✅ If entry doesn't exist yet, create it as published
      if (!draftEntryId) {
        const emotionsArray = buildEmotionsArray();

        const createResponse = await fetch("http://localhost:3000/entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: thoughts,
            IsDraft: false, // ✅ Create as published directly
            emotions: emotionsArray, // ✅ Include all emotions
          }),
        });

        if (createResponse.status === 401) {
          logout();
          return;
        }

        if (!createResponse.ok) {
          throw new Error("Failed to publish entry");
        }

        const data = await createResponse.json();
        setDraftEntryId(data.id);
        setIsPublished(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return;
      }

      // ✅ If entry already exists, publish WITHOUT sending emotions
      // This preserves AI emotions that were added before publish
      const response = await fetch(
        `http://localhost:3000/entries/${draftEntryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: thoughts,
            IsDraft: false,
            // ✅ Don't send emotions - preserve all existing emotions (user + AI)
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
  // Fetch emotions from backend
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchEmotions();
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

  const hashContent = (content: string): string => {
    return `${content.length}-${content.charCodeAt(0)}-${content.charCodeAt(content.length - 1)}`;
  };
  const generateReflection = async (detectedMoods: string[]) => {
    if (!thoughts.trim()) {
      setSaveError("Write something first");
      return;
    }

    if (!draftEntryId) {
      setSaveError("Save entry first");
      return;
    }

    try {
      setReflectionLoading(true);
      setSaveError(null);

      const response = await fetch("http://localhost:3000/entry-reflections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entryId: draftEntryId,
          content: thoughts,
          emotions: detectedMoods,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate reflection");
      }

      const data = await response.json();
      console.log("✅ Reflection response:", data);

      // Handle nested structure: data.reflectionData
      const actualReflectionData = data.reflectionData || data;
      console.log("💡 Advice from response:", actualReflectionData.advice);

      const reflectionObject = {
        reflection: actualReflectionData.reflection || "",
        advice: actualReflectionData.advice || null,
      };
      setGeneratedReflection(reflectionObject);
      setShowReflection(true);
    } catch (error) {
      console.error("Error generating reflection:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to generate reflection",
      );
    } finally {
      setReflectionLoading(false);
    }
  };
  const handleGetReflection = async () => {
    if (!thoughts.trim()) {
      setSaveError("Write something first");
      return;
    }

    if (!draftEntryId) {
      setSaveError("Save entry first");
      return;
    }

    try {
      setReflectionLoading(true);
      setSaveError(null);

      // 1. Update entry
      console.log("📝 Step 1: Updating entry...");
      const updateResponse = await fetch(
        `http://localhost:3000/entries/${draftEntryId}`,
        {
          method: "PATCH",
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
        },
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update entry");
      }

      console.log("✅ Step 1: Entry updated");

      // 2. Detect moods (AI)
      console.log("🤖 Step 2: Detecting moods...");

      const moodResponse = await fetch(
        "http://localhost:3000/entry-emotions/detect-mood",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: thoughts,
            entryId: draftEntryId,
          }),
        },
      );

      if (!moodResponse.ok) {
        const errorData = await moodResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to detect mood: ${errorData.message || moodResponse.statusText}`,
        );
      }

      const moodData = await moodResponse.json();
      console.log("🤖 Raw mood response:", moodData);
      console.log(
        "🤖 Response type:",
        typeof moodData,
        "Is array:",
        Array.isArray(moodData),
      );

      // ✅ FIX: Handle both array and object responses
      let detectedEmotions: string[] = [];

      if (Array.isArray(moodData)) {
        // If response is array
        detectedEmotions = moodData
          .map((e: any) => e.emotionName || e.emotion || e.name || "")
          .filter(Boolean);
      } else if (
        moodData.detectedEmotions &&
        Array.isArray(moodData.detectedEmotions)
      ) {
        // If response is object with detectedEmotions array
        detectedEmotions = moodData.detectedEmotions
          .map((e: any) => e.emotionName || e.emotion || e.name || "")
          .filter(Boolean);
      } else if (moodData.emotions && Array.isArray(moodData.emotions)) {
        // If response is object with emotions array
        detectedEmotions = moodData.emotions
          .map((e: any) => e.emotionName || e.emotion || e.name || "")
          .filter(Boolean);
      }

      console.log("✅ Extracted emotions:", detectedEmotions);
      console.log("✅ Emotion count:", detectedEmotions.length);

      if (detectedEmotions.length === 0) {
        console.warn("⚠️ No emotions extracted from response");
      }

      setDetectedMoods(detectedEmotions);
      console.log("✅ Step 2 Complete: Moods detected");

      // 3. Generate reflection with detected moods
      console.log("📝 Step 3: Generating reflection...");

      const reflectionResponse = await fetch(
        "http://localhost:3000/entry-reflections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entryId: draftEntryId,
            content: thoughts,
            emotions: detectedEmotions,
          }),
        },
      );

      if (!reflectionResponse.ok) {
        const reflectionError = await reflectionResponse
          .json()
          .catch(() => ({}));
        throw new Error(
          `Failed to generate reflection: ${reflectionError.message || reflectionResponse.statusText}`,
        );
      }

      const reflectionData = await reflectionResponse.json();
      console.log("✅ Reflection data:", reflectionData);

      // Handle nested structure: reflectionData.reflectionData.reflection
      const actualReflectionData =
        reflectionData.reflectionData || reflectionData;

      console.log("📋 Reflection:", actualReflectionData.reflection);
      console.log("💡 Advice:", actualReflectionData.advice);

      const reflectionObject = {
        reflection: actualReflectionData.reflection || "",
        advice: actualReflectionData.advice || null,
      };

      console.log("📦 Setting reflection object:", reflectionObject);
      setGeneratedReflection(reflectionObject);
      setShowReflection(true);
      console.log("✅ Step 3 Complete: Reflection generated");
    } catch (error) {
      console.error("❌ Error in handleGetReflection:", error);
      setSaveError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setReflectionLoading(false);
    }
  };

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
              <div style={{ marginBottom: "2rem" }}>
                {(() => {
                  const organized = organizeMoodsByCategory(moods);
                  return (
                    <>
                      {(["positive", "neutral", "negative"] as const).map(
                        (category) =>
                          organized[category] && (
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
              </div>

              {selectedMoods.length > 0 && (
                <div className={styles.selectedMoodsDisplay}>
                  <p className={styles.selectedMoodsLabel}>Selected moods:</p>
                  <div className={styles.moodTags}>
                    {selectedMoods.map((mood) => {
                      const moodObj = moods.find((m) => m.name === mood);
                      return (
                        <div key={mood} className={styles.moodTag}>
                          {moodObj?.animatedEmojiUrl && (
                            <MoodEmoji
                              animatedEmojiUrl={moodObj.animatedEmojiUrl}
                              size={50}
                            />
                          )}{" "}
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
            {saving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save as Draft"
            )}
          </button>

          <button
            className={styles.publishButton}
            onClick={publishEntry}
            disabled={saving || !thoughts.trim() || isLocked}
            title={isLocked ? "Entry already published" : ""}
          >
            {saving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Entry"
            )}
          </button>

          <button
            className={styles.reflectButton}
            onClick={handleGetReflection}
            disabled={reflectionLoading || !thoughts.trim() || isLocked}
            title={
              !thoughts.trim()
                ? "Write something first"
                : isLocked
                  ? "Published entries cannot be reflected on"
                  : "Generate AI reflection"
            }
          >
            {reflectionLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Reflect on this
              </>
            )}
          </button>

          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={!draftEntryId || saving}
            title={!draftEntryId ? "Entry must be saved first" : ""}
          >
            {saving ? "Deleting..." : "Delete"}
          </button>
        </div>

        {/* AI Reflection */}
        {showReflection && (
          <section className={styles.reflection}>
            <div className={styles.reflectionHeader}>
              <div className={styles.sparkle}>
                {reflectionLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Sparkles size={20} />
                )}
              </div>

              <div>
                <h2>A little reflection</h2>
                <p>Here's what I noticed in your entry.</p>
              </div>
            </div>

            {reflectionLoading && (
              <p
                style={{
                  textAlign: "center",
                  color: "#999",
                  marginTop: "1rem",
                }}
              >
                Generating reflection... This may take a moment.
              </p>
            )}

            {/* Show DETECTED MOODS (AI) */}
            {detectedMoods.length > 0 && !reflectionLoading && (
              <div className={styles.detectedMood}>
                <div className={styles.detectedMoodEmojis}>
                  {detectedMoods.map((mood) => {
                    // Case-insensitive mood lookup
                    const moodObj = moods.find(
                      (m) => m.name.toLowerCase() === mood.toLowerCase(),
                    );
                    console.log(`Looking up mood: "${mood}"`, moodObj); // Debug
                    return (
                      <div key={mood} className={styles.detectedMoodEmoji}>
                        {moodObj?.animatedEmojiUrl ? (
                          <MoodEmoji
                            animatedEmojiUrl={moodObj.animatedEmojiUrl}
                            size={50}
                          />
                        ) : (
                          <span title={`${mood} emoji not found`}>💭</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <p>🤖 AI Detected:</p>
                  <strong>{detectedMoods.join(", ")}</strong>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#999",
                      marginTop: "0.5rem",
                    }}
                  >
                    (The AI detected these emotions in your entry)
                  </p>
                </div>
              </div>
            )}

            {/* Show Reflection */}
            {generatedReflection?.reflection && !reflectionLoading && (
              <div style={{ marginTop: "1.5rem" }}>
                <p className={styles.reflectionText}>
                  <strong>📝 Reflection:</strong>
                </p>
                <p className={styles.reflectionText}>
                  {generatedReflection.reflection}
                </p>
              </div>
            )}

            {/* Show ADVICE */}
            {generatedReflection?.advice && !reflectionLoading && (
              <div style={{ marginTop: "1.5rem" }}>
                <p className={styles.reflectionText}>
                  <strong>💡 My Advice:</strong>
                </p>
                <p className={styles.reflectionText}>
                  {generatedReflection.advice}
                </p>
              </div>
            )}

            <p className={styles.aiDisclaimer}>
              ✨ This reflection was generated by AI and is not a diagnosis.
            </p>

            {/* ✅ Only show action buttons if entry is NOT published */}
            {!isLocked && (
              <div className={styles.reflectionActions}>
                <button
                  onClick={() => {
                    setGeneratedReflection(null);
                    generateReflection(detectedMoods);
                  }}
                  disabled={reflectionLoading}
                >
                  {reflectionLoading
                    ? "Generating..."
                    : "Get another reflection"}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
