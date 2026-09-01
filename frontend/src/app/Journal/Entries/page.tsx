"use client";

import { useState, useEffect, FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Trash2, Edit2, ChevronLeft, Eye } from "lucide-react";
import { useTokenExpiration } from "../../../../hooks/useTokenExpiration";

interface EmotionType {
  id: string;
  emotionName: string;
  emoji: string;
}

interface EntryType {
  id: string;
  content: string;
  date: string;
  title?: string;
  isDraft: boolean;
  emotions: EmotionType[];
  wordCount: number;
  attachmentCount: number;
  isAiDetected?: boolean;
}

interface FetchedEmotion {
  emotionId: string;
  emotionName: string;
  emoji: string;
}

interface EntriesResponse {
  entries: EntryType[];
  emotion?: FetchedEmotion;
}

const EntriesContent: FC = () => {
  useTokenExpiration();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Safe initialization with defaults
  const emotionId: string | null = searchParams
    ? (searchParams.get("emotion") ?? null)
    : null;
  const isDraftsView: boolean = searchParams
    ? searchParams.get("view") === "drafts"
    : false;

  const [entries, setEntries] = useState<EntryType[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EntryType[]>([]);
  const [emotion, setEmotion] = useState<FetchedEmotion | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchEntries = async () => {
      if (!token) {
        setIsLoading(false);
        setError("No authentication token found");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let url = "http://localhost:3000/entries";
        if (isDraftsView) {
          url = `${url}?isDraft=true`;
        } else if (emotionId) {
          url = `${url}?emotionId=${emotionId}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch entries: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Raw API data:", data);

        // ✅ FIX: Handle both array response AND object with entries property
        const entriesArray = Array.isArray(data) ? data : data?.entries || [];

        if (entriesArray.length > 0) {
          const transformedEntries = entriesArray.map((entry: any) => {
            const wordCount = (entry.content || "")
              .trim()
              .split(/\s+/)
              .filter((word: string) => word.length > 0).length;

            console.log("Word count:", wordCount);

            const attachmentCount = Array.isArray(entry.attachments)
              ? entry.attachments.length
              : 0;
            console.log("Attachment count:", attachmentCount);

            const transformedEmotions = (entry.emotions || []).map(
              (emotionEntry: any) => ({
                id:
                  emotionEntry.emotion?.id?.toString() ||
                  emotionEntry.id?.toString() ||
                  "",
                emotionName: emotionEntry.emotion?.name || "Unknown",
                emoji: emotionEntry.emotion?.emoji || "😐",
              }),
            );

            return {
              id: entry.id.toString(),
              content: entry.content || "",
              date: entry.createdAt || entry.date || new Date().toISOString(),
              title: entry.title || "",
              isDraft: entry.isDraft ?? false,
              emotions: transformedEmotions,
              wordCount,
              attachmentCount,
              isAiDetected: entry.isAiDetected ?? false,
            };
          });
          console.log("Transformed entries:", transformedEntries);
          setEntries(transformedEntries);
        } else {
          setEntries([]);
        }

        // Set emotion info if not drafts view
        if (!isDraftsView && data?.emotion) {
          setEmotion(data.emotion);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load entries",
        );
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [emotionId, isDraftsView, token]);

  // Filter entries based on search and date
  useEffect(() => {
    try {
      if (!entries || entries.length === 0) {
        setFilteredEntries([]);
        return;
      }

      let filtered: EntryType[] = entries.slice();

      // Search by content, title, AND emotions
      if (searchQuery && searchQuery.trim()) {
        const lowerSearch = searchQuery.toLowerCase();
        filtered = filtered.filter((entry) => {
          const contentMatch = entry.content
            ?.toLowerCase()
            .includes(lowerSearch);
          const titleMatch = entry.title?.toLowerCase().includes(lowerSearch);
          const emotionMatch = entry.emotions?.some((emotion) =>
            emotion.emotionName.toLowerCase().includes(lowerSearch),
          );

          return contentMatch || titleMatch || emotionMatch;
        });
      }

      // Filter by date
      if (selectedDate && selectedDate.trim()) {
        filtered = filtered.filter((entry) =>
          entry.date?.startsWith(selectedDate),
        );
      }

      setFilteredEntries(filtered);
    } catch (err) {
      console.error("Error filtering entries:", err);
      setFilteredEntries(entries || []);
    }
  }, [entries, searchQuery, selectedDate]);

  // Trigger load animation
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`http://localhost:3000/entries/${entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete entry");

      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry");
    }
  };

  // ✅ UPDATED: Route to journal with entryId as query parameter
  const handleEditEntry = (entryId: string) => {
    router.push(`/Journal?id=${entryId}`);
  };

  // ✅ UPDATED: Route to journal with entryId as query parameter (same as edit for viewing)
  const handleViewEntry = (entryId: string) => {
    router.push(`/Journal?id=${entryId}`);
  };

  const handleBackToDashboard = () => {
    router.push("/Dashboard");
  };

  const getPreviewText = (content: string): string => {
    if (!content) return "";
    const words = content.split(" ");
    return words.slice(0, 15).join(" ") + (words.length > 15 ? "..." : "");
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const pageTitle = isDraftsView ? "Drafts" : emotion?.emotionName || "Entries";
  const pageEmoji = isDraftsView ? "📝" : emotion?.emoji;

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#fafafa" }}
    >
      {/* HEADER */}
      <div
        className="px-4 md:px-8 lg:px-16 py-8 border-b"
        style={{ borderColor: "#F9C5C7" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Back Button & Title */}
          <div
            className={`flex items-center gap-4 mb-6 transition-all duration-700 ${
              isLoaded
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-lg transition-all hover:bg-white hover:shadow-md"
              style={{ color: "#f782a9" }}
              type="button"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a1a1a",
                }}
              >
                {pageEmoji} {pageTitle}
              </h1>
            </div>
          </div>

          {/* Search and Date Filter */}
          <div
            className={`flex gap-3 flex-col sm:flex-row transition-all duration-700 ${
              isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            style={{ transitionDelay: isLoaded ? "100ms" : "0ms" }}
          >
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: "#ccc" }}
              />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-pink-300"
                style={
                  {
                    borderColor: "#F9C5C7",
                    backgroundColor: "#fff",
                    color: "#1a1a1a",
                  } as React.CSSProperties
                }
              />
            </div>

            {/* Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-pink-300"
              style={
                {
                  borderColor: "#F9C5C7",
                  backgroundColor: "#fff",
                  color: "#1a1a1a",
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </div>

      {/* ENTRIES GRID */}
      <div className="px-4 md:px-8 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div
              className="p-6 mb-6 rounded-2xl text-sm"
              style={{
                backgroundColor: "#fee",
                border: "1px solid #f99",
                color: "#c00",
              }}
            >
              Error: {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p style={{ color: "#999", fontFamily: "'Poppins', sans-serif" }}>
                Loading entries...
              </p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div
              className="p-12 text-center rounded-2xl"
              style={{
                backgroundColor: "#fff0f5",
                border: "2px dashed #F9C5C7",
              }}
            >
              <p
                style={{ color: "#999", fontFamily: "'Poppins', sans-serif" }}
                className="text-lg"
              >
                {searchQuery || selectedDate
                  ? "No entries match your filters"
                  : "No entries yet. Start journaling!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`transition-all duration-700 ${
                    isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isLoaded ? `${index * 50}ms` : "0ms",
                  }}
                >
                  <div
                    className="h-full rounded-2xl p-5 flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-105"
                    style={{
                      backgroundColor: "#fff",
                      border: "0.5px solid #F9C5C7",
                      boxShadow: "0 4px 16px rgba(247, 130, 169, 0.08)",
                    }}
                  >
                    {/* Header - Date and Emotion/Draft Tag */}
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#999" }}
                      >
                        {formatDate(entry.date)}
                      </span>

                      {isDraftsView ? (
                        // For drafts: show selected emotions
                        <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                          {entry.emotions?.slice(0, 2).map((emotion) => (
                            <span
                              key={emotion.id}
                              className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                              style={{
                                backgroundColor: "#f9f9f9",
                                border: "0.5px solid #F9C5C7",
                                color: "#1a1a1a",
                              }}
                            >
                              {emotion.emotionName}
                            </span>
                          ))}
                          {entry.emotions && entry.emotions.length > 2 && (
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: "#f9f9f9",
                                border: "0.5px solid #F9C5C7",
                                color: "#999",
                              }}
                            >
                              +{entry.emotions.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        // For emotion entries: show single emotion tag
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                          style={{
                            backgroundColor: "#f9f9f9",
                            border: "0.5px solid #F9C5C7",
                            color: "#1a1a1a",
                          }}
                        >
                          {emotion?.emotionName}
                          {entry.isAiDetected && (
                            <span style={{ fontSize: "10px" }}>✨</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Preview Text */}
                    <p
                      className="flex-grow mb-3 text-sm leading-relaxed"
                      style={{
                        color: "#1a1a1a",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {getPreviewText(entry.content)}
                    </p>

                    {/* Attachments Badge */}
                    {entry.attachmentCount > 0 && (
                      <div className="mb-3">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: "#f9f9f9",
                            border: "0.5px solid #F9C5C7",
                            color: "#999",
                          }}
                        >
                          {entry.attachmentCount}{" "}
                          {entry.attachmentCount === 1
                            ? "attachment"
                            : "attachments"}
                        </span>
                      </div>
                    )}

                    {/* Footer - Word count and Actions */}
                    <div
                      className="pt-3 border-t flex justify-between items-center"
                      style={{ borderColor: "#F9C5C7" }}
                    >
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#999" }}
                      >
                        {entry.wordCount} words
                      </span>

                      <div className="flex gap-2">
                        {entry.isDraft ? (
                          // ✅ Show Edit button for drafts
                          <button
                            onClick={() => handleEditEntry(entry.id)}
                            className="p-2 rounded-lg transition-all hover:bg-gray-100"
                            title="Edit draft entry"
                            style={{ color: "#f782a9" }}
                            type="button"
                          >
                            <Edit2 size={16} />
                          </button>
                        ) : (
                          // ✅ Show View button for published entries
                          <button
                            onClick={() => handleViewEntry(entry.id)}
                            className="p-2 rounded-lg transition-all hover:bg-gray-100"
                            title="View published entry (locked)"
                            style={{ color: "#f782a9" }}
                            type="button"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 rounded-lg transition-all hover:bg-red-50"
                          title="Delete entry"
                          style={{ color: "#ff6b6b" }}
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EmotionEntriesPage() {
  return <EntriesContent />;
}
