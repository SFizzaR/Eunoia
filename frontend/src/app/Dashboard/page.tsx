"use client";

import { useState, useEffect } from "react";
import { User, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTokenExpiration } from "../../../hooks/useTokenExpiration";
import { logout } from "../../../lib/auth";
import { useCachedQuote } from "../../../hooks/useCachedQuotes";

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  title?: string;
  isDraft: boolean;
  emotions: Array<{ id: string; emotionName: string; emoji: string }>;
}

interface Emotion {
  emotionId: string;
  emotionName: string;
  emoji: string;
  entryCount: number;
}

// Consistent folder colors - not tied to emotions
const FOLDER_COLORS = [
  "#f782a9", // Pink
  "#ff6b9d", // Deep pink
  "#f56a9f", // Lighter pink
  "#e75480", // Darker pink
  "#d63869", // Even darker
];

export default function Dashboard() {
  useTokenExpiration();
  const router = useRouter();

  // State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // New state for dynamic emotions and entries
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [draftCount, setDraftCount] = useState(0);
  const [totalPublishedEntries, setTotalPublishedEntries] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);
  const { quote: quoteOfDay, author } = useCachedQuote();
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch("http://localhost:3000/entries/count", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch counts");

        const data = await response.json();

        // Set emotions with their entry counts
        setEmotions(data.emotions);

        // Set draft and published counts
        setDraftCount(data.draftCount);
        setTotalPublishedEntries(data.totalPublishedEntries);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    if (token) {
      fetchCounts();
    }
  }, [token]);

  // ✅ Initialize component
  useEffect(() => {
    setIsLoaded(true);
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
    const user = localStorage.getItem("user");
    if (user) {
      setUserName(JSON.parse(user).firstname);
      const pfp = JSON.parse(user).profileImageUrl;
      if (pfp !== null) {
        setProfileImage(JSON.parse(user).profileImageUrl);
      }
      const cover = JSON.parse(user).coverImageUrl;
      if (cover) {
        setHeaderImage(cover);
      }
    }
  }, []);

  const handleViewEmotion = (emotionId: string) => {
    router.push(`/Journal/Entries?emotion=${emotionId}`);
  };

  const handleViewDrafts = () => {
    router.push(`/Journal/Entries?view=drafts`);
  };

  const updateStoredUserImages = (updates: {
    profileImageUrl?: string;
    coverImageUrl?: string;
  }) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    localStorage.setItem("user", JSON.stringify({ ...user, ...updates }));
  };

  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3000/users/profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      const uploadedImageUrl =
        data.profileImageUrl || data.imageUrl || data.url;
      if (uploadedImageUrl) {
        setProfileImage(uploadedImageUrl);
        updateStoredUserImages({ profileImageUrl: uploadedImageUrl });
      }
      e.target.value = "";
    } catch (error) {
      console.error("Profile image upload failed:", error);
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to remove your profile picture?",
      );
      if (!confirmed) return;

      const res = await fetch("http://localhost:3000/users/profile-image", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete profile image");
      }

      setProfileImage(null);
      updateStoredUserImages({ profileImageUrl: "" });
    } catch (error) {
      console.error("Profile image deletion failed:", error);
    }
  };

  const handleDeleteHeaderImage = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to remove your profile picture?",
      );
      if (!confirmed) return;

      const res = await fetch("http://localhost:3000/users/cover-photo", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete cover photo");
      }

      setHeaderImage(null);
      updateStoredUserImages({ coverImageUrl: "" });
    } catch (error) {
      console.error("Cover photo deletion failed:", error);
    }
  };

  const handleHeaderImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3000/users/cover-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      const uploadedHeaderImageUrl =
        data.coverImageUrl || data.imageUrl || data.url;
      if (uploadedHeaderImageUrl) {
        setHeaderImage(uploadedHeaderImageUrl);
        updateStoredUserImages({ coverImageUrl: uploadedHeaderImageUrl });
      }
      e.target.value = "";
    } catch (error) {
      console.error("Header image upload failed:", error);
    }
  };

  const handleAddEntry = () => {
    router.push("/Journal");
  };

  const getColorForEmotion = (index: number) => {
    return FOLDER_COLORS[index % FOLDER_COLORS.length];
  };

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#fafafa" }}
    >
      {/* HEADER WITH BACKGROUND IMAGE */}
      <div
        className={`relative z-0 w-full h-64 md:h-80 overflow-hidden transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: headerImage
            ? `url(${headerImage})`
            : "linear-gradient(135deg, #f782a9 0%, #F9C5C7 100%)",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)",
          }}
        />

        {/* Header Image Upload */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <label htmlFor="header-upload" className="cursor-pointer">
            <div
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 255, 255, 0.8)",
              }}
              title="Change cover photo"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>

            <input
              id="header-upload"
              type="file"
              accept="image/*"
              onChange={handleHeaderImageUpload}
              className="hidden"
            />
          </label>

          {headerImage && (
            <button
              type="button"
              onClick={handleDeleteHeaderImage}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.55)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 255, 255, 0.5)",
              }}
              title="Remove cover photo"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          )}
        </div>

        {/* Current Date in Header */}
        <div
          className="absolute bottom-4 left-4 text-white text-sm md:text-base font-medium"
          style={{
            textShadow: "2px 2px 6px rgba(0, 0, 0, 0.36)",
          }}
        >
          {currentDate}
        </div>
      </div>

      {/* PROFILE & STATS SECTION */}
      <div className="relative px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Section */}
          <div className="flex items-end gap-6 mb-12">
            {/* Profile Image */}
            <div className="relative group">
              <div
                className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                  isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
                style={{
                  borderColor: "#f782a9",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-end justify-center overflow-hidden"
                    style={{ backgroundColor: "#F9C5C7" }}
                  >
                    <User
                      size={100}
                      color="#ffffff"
                      strokeWidth={1.8}
                      className="translate-y-2"
                    />
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <label
                  htmlFor="profile-upload"
                  className="cursor-pointer translate-y-4"
                >
                  <div
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                    style={{
                      backgroundColor: "#f782a9",
                    }}
                    title="Change profile picture"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>

                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </label>

                {profileImage && (
                  <button
                    type="button"
                    onClick={handleDeleteProfileImage}
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                    style={{
                      backgroundColor: "#1a1a1a",
                    }}
                    title="Remove profile picture"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div
              className={`pb-2 transition-all duration-500 ${
                isLoaded
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <h1
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a1a1a",
                }}
              >
                Welcome, {userName}
              </h1>
              <p
                className="text-lg text-gray-600"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                You have{" "}
                <span className="font-semibold" style={{ color: "#f782a9" }}>
                  {totalPublishedEntries}
                </span>{" "}
                published entries and{" "}
                <span className="font-semibold" style={{ color: "#f782a9" }}>
                  {draftCount}
                </span>{" "}
                drafts
              </p>
            </div>
          </div>

          {/* QUOTE OF THE DAY */}
          <div
            className={`mb-12 p-8 rounded-2xl transition-all duration-700 ${
              isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            style={{
              backgroundColor: "#FFF",
              border: "2px solid #F9C5C7",
              boxShadow: "0 8px 32px rgba(247, 130, 169, 0.1)",
            }}
          >
            <p
              className="text-xl md:text-2xl text-center leading-relaxed italic"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1a1a1a",
              }}
            >
              "{quoteOfDay}"
            </p>
            <p
              className="text-center text-sm mt-4"
              style={{
                color: "#f782a9",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              — {author}
            </p>
          </div>

          {/* ADD NEW ENTRY BUTTON */}
          <div
            className={`flex justify-center mb-16 transition-all duration-700 ${
              isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <button
              onClick={handleAddEntry}
              className="relative group"
              style={{
                width: "60px",
                height: "60px",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  background:
                    "linear-gradient(135deg, #F9C5C7 0%, #f782a9 100%)",
                  boxShadow: "0 4px 20px rgba(247, 130, 169, 0.35)",
                }}
              >
                <span className="text-3xl font-bold text-white">+</span>
              </div>
              <div
                className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg whitespace-nowrap text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  fontSize: "12px",
                }}
              >
                Add Entry
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* EMOTION FOLDERS & DRAFTS */}
      <div className="px-4 md:px-8 lg:px-16 mb-16">
        <div className="max-w-6xl mx-auto">
          {/* Drafts Folder - Show if there are drafts */}
          {draftCount > 0 && (
            <div className="mb-12">
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#1a1a1a",
                }}
              >
                📝 Drafts ({draftCount})
              </h2>
              <div
                className="p-6 rounded-2xl cursor-pointer transition-all hover:shadow-lg"
                style={{
                  backgroundColor: "#fff9f0",
                  border: "2px dashed #ddd",
                }}
                onClick={handleViewDrafts}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "#1a1a1a" }}
                    >
                      Your Drafts
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Continue editing your drafts
                    </p>
                  </div>
                  <Pencil size={24} color="#A9A9A9" />
                </div>
              </div>
            </div>
          )}

          {/* Emotions Grid */}
          {emotions.length > 0 && (
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#1a1a1a",
                }}
              >
                📂 Your Emotions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {emotions
                  .filter((emotion) => emotion.entryCount > 0)
                  .map((emotion, index) => {
                    const entryCount = emotion.entryCount; // ✅ Get from API response
                    const folderColor = getColorForEmotion(index);
                    return (
                      <div
                        key={emotion.emotionId}
                        className={`transition-all duration-700 ${
                          isLoaded
                            ? "scale-100 opacity-100"
                            : "scale-95 opacity-0"
                        }`}
                        style={{
                          transitionDelay: isLoaded
                            ? `${index * 100}ms`
                            : "0ms",
                        }}
                        onClick={() => handleViewEmotion(emotion.emotionId)}
                      >
                        <div
                          className="h-full rounded-2xl p-6 cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          style={{
                            backgroundColor: "#f9f9f9",
                            border: `2px solid ${folderColor}`,
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {/* Emotion Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex flex-col gap-2">
                              <span className="text-3xl">{emotion.emoji}</span>

                              <h3
                                className="text-xl font-bold"
                                style={{
                                  fontFamily: "'Poppins', sans-serif",
                                  color: "#1a1a1a",
                                }}
                              >
                                {emotion.emotionName}
                              </h3>
                            </div>

                            <div
                              className="px-3 py-1 rounded-full text-sm font-semibold"
                              style={{
                                backgroundColor: folderColor,
                                color: "#fff",
                              }}
                            >
                              {entryCount}
                            </div>
                          </div>

                          {/* FOLDER VISUALIZATION */}
                          <div className="relative h-40 flex items-end justify-center mb-3">
                            {/* Papers behind folder */}
                            {entryCount > 0 && (
                              <>
                                {/* Paper 1 */}
                                <div
                                  className="
              absolute
              bottom-4
              w-24
              h-30
              rounded-md
              bg-white
              border
              border-gray-200
              shadow-md
              transition-all
              duration-500
              ease-out
              rotate-[-8deg]
              group-hover:-translate-y-5
              group-hover:rotate-[-12deg]
            "
                                >
                                  <div className="absolute top-5 left-3 right-3 space-y-1.5 opacity-40">
                                    <div className="h-px bg-gray-300" />
                                    <div className="h-px bg-gray-300" />
                                    <div className="h-px bg-gray-300 w-3/4" />
                                  </div>
                                </div>

                                {/* Paper 2 */}
                                {entryCount >= 2 && (
                                  <div
                                    className="
                absolute
                bottom-4
                w-24
                h-30
                rounded-md
                bg-white
                border
                border-gray-200
                shadow-md
                transition-all
                duration-500
                ease-out
                rotate-[7deg]
                group-hover:-translate-y-6
                group-hover:rotate-[11deg]
              "
                                  >
                                    <div className="absolute top-5 left-3 right-3 space-y-1.5 opacity-40">
                                      <div className="h-px bg-gray-300" />
                                      <div className="h-px bg-gray-300" />
                                      <div className="h-px bg-gray-300 w-2/3" />
                                    </div>
                                  </div>
                                )}

                                {/* Paper 3 */}
                                {entryCount >= 3 && (
                                  <div
                                    className="
                absolute
                bottom-4
                w-24
                h-30
                rounded-md
                bg-white
                border
                border-gray-200
                shadow-md
                transition-all
                duration-500
                ease-out
                rotate-[-2deg]
                group-hover:-translate-y-7
                group-hover:rotate-[-3deg]
              "
                                  >
                                    <div className="absolute top-5 left-3 right-3 space-y-1.5 opacity-40">
                                      <div className="h-px bg-gray-300" />
                                      <div className="h-px bg-gray-300" />
                                      <div className="h-px bg-gray-300 w-4/5" />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Folder back / tab */}
                            <div
                              className="
        absolute
        bottom-4
        w-40
        h-24
        rounded-t-lg
      "
                              style={{
                                backgroundColor: folderColor,
                              }}
                            >
                              {/* Folder tab */}
                              <div
                                className="
          absolute
          -top-3
          left-0
          w-16
          h-5
          rounded-t-md
        "
                                style={{
                                  backgroundColor: folderColor,
                                }}
                              />
                            </div>

                            {/* Folder front */}
                            <div
                              className="
        absolute
        bottom-0
        w-44
        h-27
        rounded-lg
        transition-all
        duration-500
        ease-out
        group-hover:-translate-y-1
      "
                              style={{
                                backgroundColor: folderColor,
                                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.10)",
                              }}
                            >
                              {/* Subtle folder highlight */}
                              <div
                                className="
          absolute
          top-2.5
          left-3
          right-3
          h-px
          opacity-30
        "
                                style={{
                                  backgroundColor: "#ffffff",
                                }}
                              />

                              {/* Folder label */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span
                                  className="text-base font-semibold text-white"
                                  style={{
                                    fontFamily: "'Poppins', sans-serif",
                                  }}
                                >
                                  {emotion.emotionName}
                                </span>

                                <span
                                  className="text-[11px] mt-0.5 text-white opacity-75"
                                  style={{
                                    fontFamily: "'Poppins', sans-serif",
                                  }}
                                >
                                  {entryCount}{" "}
                                  {entryCount === 1 ? "entry" : "entries"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <p
                            className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors"
                            style={{
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            View all →
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Loading state for emotions */}
          {emotions.length === 0 && isLoaded && (
            <div
              className="p-8 text-center rounded-lg"
              style={{
                backgroundColor: "#fff0f5",
                border: "1px solid #f9c5c7",
              }}
            >
              <p style={{ color: "#999", fontFamily: "'Poppins', sans-serif" }}>
                Loading emotions...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
