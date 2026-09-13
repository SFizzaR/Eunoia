import { useState, useCallback } from "react";
import { logout } from "../lib/auth";
import { UseProfileImageReturn } from "@/types/dashboard";
/**
 * Hook for managing profile image uploads and deletion
 */
export const useProfileImage = (): UseProfileImageReturn => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown, defaultMessage: string) => {
    const message = err instanceof Error ? err.message : defaultMessage;
    setError(message);
    console.error(message, err);
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateStoredUserImage = useCallback((imageUrl: string | null) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const updated = { ...user, profileImageUrl: imageUrl || "" };
    localStorage.setItem("user", JSON.stringify(updated));
  }, []);

  const uploadProfileImage = useCallback(
    async (file: File, token: string) => {
      try {
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "http://localhost:3000/users/profile-image",
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to upload profile picture");
        }

        const uploadedImageUrl =
          data.profileImageUrl || data.imageUrl || data.url;
        if (uploadedImageUrl) {
          setProfileImage(uploadedImageUrl);
          updateStoredUserImage(uploadedImageUrl);
        }
      } catch (err) {
        handleError(err, "Failed to upload profile picture");
      } finally {
        setUploading(false);
      }
    },
    [updateStoredUserImage],
  );

  const deleteProfileImage = useCallback(
    async (token: string) => {
      const confirmed = window.confirm(
        "Are you sure you want to remove your profile picture?",
      );
      if (!confirmed) return;

      try {
        setDeleting(true);
        setError(null);

        const response = await fetch(
          "http://localhost:3000/users/profile-image",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          logout();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete profile picture");
        }

        setProfileImage(null);
        updateStoredUserImage(null);
      } catch (err) {
        handleError(err, "Failed to delete profile picture");
      } finally {
        setDeleting(false);
      }
    },
    [updateStoredUserImage],
  );

  return {
    profileImage,
    uploading,
    deleting,
    error,
    setProfileImage,
    uploadProfileImage,
    deleteProfileImage,
    clearError,
  };
};
