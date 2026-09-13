import { User } from "lucide-react";
import { COLORS } from "../constants/dashboard";
import { ProfileSectionProps } from "@/types/dashboard";

export function ProfileSection({
  userName,
  profileImage,
  publishedCount,
  draftCount,
  isLoaded,
  onProfileImageUpload,
  onProfileImageDelete,
  uploading = false,
  deleting = false,
}: ProfileSectionProps) {
  const isImageLoading = uploading || deleting;

  return (
    <div className="flex items-end gap-6 mb-12">
      {/* Profile Image */}
      <div className="relative group">
        <div
          className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
            isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          style={{
            borderColor: COLORS.PRIMARY,
            boxShadow: `0 8px 32px ${COLORS.SHADOW_MEDIUM}`,
            opacity: isImageLoading ? 0.6 : 1,
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
              style={{ backgroundColor: COLORS.SECONDARY }}
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

        {/* Image Upload/Delete Buttons */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <label
            htmlFor="profile-upload"
            className="cursor-pointer translate-y-4"
          >
            <div
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: COLORS.PRIMARY,
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
              onChange={onProfileImageUpload}
              className="hidden"
              disabled={isImageLoading}
            />
          </label>

          {profileImage && (
            <button
              type="button"
              onClick={onProfileImageDelete}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: "#1a1a1a",
              }}
              title="Remove profile picture"
              disabled={isImageLoading}
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
          isLoaded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
        }`}
      >
        <h1
          className="text-4xl md:text-5xl font-bold mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: COLORS.TEXT_PRIMARY,
          }}
        >
          Welcome, {userName}
        </h1>
        <p
          className="text-lg"
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: COLORS.TEXT_MUTED,
          }}
        >
          You have{" "}
          <span className="font-semibold" style={{ color: COLORS.PRIMARY }}>
            {publishedCount}
          </span>{" "}
          published entries and{" "}
          <span className="font-semibold" style={{ color: COLORS.PRIMARY }}>
            {draftCount}
          </span>{" "}
          drafts
        </p>
      </div>
    </div>
  );
}
