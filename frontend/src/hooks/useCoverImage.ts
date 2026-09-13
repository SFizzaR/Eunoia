import { useState, useCallback } from "react";
import { logout } from "../lib/auth";
import { UseCoverImageReturn } from "@/types/dashboard";

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

        const response = await fetch(
          "http://localhost:3000/users/cover-photo",
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
          throw new Error(data.message || "Failed to upload cover photo");
        }

        const uploadedImageUrl =
          data.coverImageUrl || data.imageUrl || data.url;
        if (uploadedImageUrl) {
          setCoverImage(uploadedImageUrl);
          updateStoredCoverImage(uploadedImageUrl);
        }
      } catch (err) {
        handleError(err, "Failed to upload cover photo");
      } finally {
        setUploading(false);
      }
    },
    [updateStoredCoverImage],
  );

  const deleteCoverImage = useCallback(
    async (token: string) => {
      const confirmed = window.confirm(
        "Are you sure you want to remove your profile picture?",
      );
      if (!confirmed) return;

      try {
        setDeleting(true);
        setError(null);

        const response = await fetch(
          "http://localhost:3000/users/cover-photo",
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
          throw new Error(data.message || "Failed to delete cover photo");
        }

        setCoverImage(null);
        updateStoredCoverImage(null);
      } catch (err) {
        handleError(err, "Failed to delete cover photo");
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
