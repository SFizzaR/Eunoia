import { useState, useCallback } from "react";
import { DASHBOARD_API, MESSAGES } from "../constants/dashboard";
import { logout } from "../lib/auth";
import { UseCoverImageReturn } from "@/types/dashboard";

/**
 * Hook for managing cover/header image uploads and deletion
 */
export const useCoverImage = (): UseCoverImageReturn => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
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

  const updateStoredCoverImage = useCallback((imageUrl: string | null) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const updated = { ...user, coverImageUrl: imageUrl || "" };
    localStorage.setItem("user", JSON.stringify(updated));
  }, []);

  const uploadCoverImage = useCallback(
    async (file: File, token: string) => {
      try {
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(DASHBOARD_API.COVER_PHOTO, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.status === 401) {
          logout();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || MESSAGES.COVER_PHOTO_UPLOAD_FAILED);
        }

        const uploadedImageUrl =
          data.coverImageUrl || data.imageUrl || data.url;
        if (uploadedImageUrl) {
          setCoverImage(uploadedImageUrl);
          updateStoredCoverImage(uploadedImageUrl);
        }
      } catch (err) {
        handleError(err, MESSAGES.COVER_PHOTO_UPLOAD_FAILED);
      } finally {
        setUploading(false);
      }
    },
    [updateStoredCoverImage],
  );

  const deleteCoverImage = useCallback(
    async (token: string) => {
      const confirmed = window.confirm(MESSAGES.COVER_IMAGE_DELETE_CONFIRM);
      if (!confirmed) return;

      try {
        setDeleting(true);
        setError(null);

        const response = await fetch(DASHBOARD_API.COVER_PHOTO, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          logout();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || MESSAGES.COVER_PHOTO_DELETE_FAILED);
        }

        setCoverImage(null);
        updateStoredCoverImage(null);
      } catch (err) {
        handleError(err, MESSAGES.COVER_PHOTO_DELETE_FAILED);
      } finally {
        setDeleting(false);
      }
    },
    [updateStoredCoverImage],
  );

  return {
    coverImage,
    uploading,
    deleting,
    error,
    setCoverImage,
    uploadCoverImage,
    deleteCoverImage,
    clearError,
  };
};
