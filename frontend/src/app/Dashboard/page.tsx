"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTokenExpiration } from "../../hooks/useTokenExpiration";
import { useCachedQuote } from "../../hooks/useCachedQuotes";
import { useDashboardData } from "../../hooks/useData";
import { useProfileImage } from "../../hooks/useProfileImage";
import { useCoverImage } from "../../hooks/useCoverImage";
import { COLORS, CATEGORY_CONFIG, MESSAGES } from "../../constants/dashboard";
import {
  formatCurrentDate,
  hasEmotions,
  extractUserInfo,
  loadUserData,
} from "../../utils/dashboardUtils";
import { HeaderSection } from "../../components/HeaderSection";
import { ProfileSection } from "../../components/ProfileSection";
import { QuoteSection } from "../../components/QuoteSection";
import { DraftsFolder } from "../../components/DraftsFolder";
import { EmotionSection } from "../../components/EmotionSection";
import { AddEntryButton } from "../../components/AddEntryButton";

/**
 * Dashboard Component - Refactored for clean code principles
 * Orchestrates all dashboard pieces including profile, emotions, and entries
 */
export default function Dashboard() {
  useTokenExpiration();
  const router = useRouter();

  // State management via custom hooks
  const {
    categorizedEmotions,
    draftCount,
    totalPublishedEntries,
    fetchDashboardData,
  } = useDashboardData();
  const {
    profileImage,
    uploadProfileImage,
    deleteProfileImage,
    setProfileImage,
  } = useProfileImage();
  const { coverImage, uploadCoverImage, deleteCoverImage, setCoverImage } =
    useCoverImage();

  // Local UI state
  const [currentDate, setCurrentDate] = useState("");
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { quote: quoteOfDay, author } = useCachedQuote();

  // Initialize on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Fetch dashboard data when token is available
  useEffect(() => {
    if (token) {
      fetchDashboardData(token);
    }
  }, [token, fetchDashboardData]);

  // Initialize component data from localStorage
  useEffect(() => {
    setIsLoaded(true);
    setCurrentDate(formatCurrentDate());

    const userData = loadUserData("user");
    if (userData) {
      const { firstName, profileImage, coverImage } = extractUserInfo(userData);
      setUserName(firstName);
      if (profileImage) {
        setProfileImage(profileImage);
      }
      if (coverImage) {
        setCoverImage(coverImage);
      }
    }
  }, [setProfileImage, setCoverImage]);

  // Navigation handlers
  const handleViewEmotion = (emotionId: string) => {
    router.push(`/Journal/Entries?emotion=${emotionId}`);
  };

  const handleViewDrafts = () => {
    router.push("/Journal/Entries?view=drafts");
  };

  const handleAddEntry = () => {
    router.push("/Journal");
  };

  // Image upload handlers
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    await uploadProfileImage(file, token);
    e.target.value = "";
  };

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    await uploadCoverImage(file, token);
    e.target.value = "";
  };

  const handleProfileImageDelete = async () => {
    if (!token) return;
    await deleteProfileImage(token);
  };

  const handleCoverImageDelete = async () => {
    if (!token) return;
    await deleteCoverImage(token);
  };

  // Check if there are emotions to display
  const hasAnyEmotions = hasEmotions(categorizedEmotions);

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: COLORS.BG_LIGHT }}
    >
      {/* HEADER SECTION */}
      <HeaderSection
        headerImage={coverImage}
        currentDate={currentDate}
        isLoaded={isLoaded}
        onHeaderImageUpload={handleCoverImageUpload}
        onHeaderImageDelete={handleCoverImageDelete}
      />

      {/* PROFILE & STATS SECTION */}
      <div className="relative px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Section */}
          <ProfileSection
            userName={userName}
            profileImage={profileImage}
            publishedCount={totalPublishedEntries}
            draftCount={draftCount}
            isLoaded={isLoaded}
            onProfileImageUpload={handleProfileImageUpload}
            onProfileImageDelete={handleProfileImageDelete}
          />

          {/* Quote Section */}
          <QuoteSection
            quote={quoteOfDay}
            author={author}
            isLoaded={isLoaded}
          />

          {/* Add Entry Button */}
          <div
            className={`flex justify-center mb-16 transition-all duration-700 ${
              isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <AddEntryButton onAddEntry={handleAddEntry} />
          </div>
        </div>
      </div>

      {/* EMOTION FOLDERS & DRAFTS SECTION */}
      <div className="px-4 md:px-8 lg:px-16 mb-16">
        <div className="max-w-6xl mx-auto">
          {/* Drafts Folder */}
          <DraftsFolder
            draftCount={draftCount}
            onViewDrafts={handleViewDrafts}
          />

          {/* Emotion Sections */}
          {hasAnyEmotions ? (
            <>
              {/* Positive Emotions */}
              <EmotionSection
                title={CATEGORY_CONFIG.positive.label}
                color={CATEGORY_CONFIG.positive.color}
                emotions={categorizedEmotions.positive}
                isLoaded={isLoaded}
                onViewEmotion={handleViewEmotion}
              />

              {/* Neutral Emotions */}
              <EmotionSection
                title={CATEGORY_CONFIG.neutral.label}
                color={CATEGORY_CONFIG.neutral.color}
                emotions={categorizedEmotions.neutral}
                isLoaded={isLoaded}
                onViewEmotion={handleViewEmotion}
              />

              {/* Challenging Emotions */}
              <EmotionSection
                title={CATEGORY_CONFIG.negative.label}
                color={CATEGORY_CONFIG.negative.color}
                emotions={categorizedEmotions.negative}
                isLoaded={isLoaded}
                onViewEmotion={handleViewEmotion}
              />
            </>
          ) : (
            isLoaded && (
              <div
                className="p-8 text-center rounded-lg"
                style={{
                  backgroundColor: "#fff0f5",
                  border: "1px solid #f9c5c7",
                }}
              >
                <p
                  style={{
                    color: COLORS.TEXT_SECONDARY,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {MESSAGES.NO_EMOTIONS_YET}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
