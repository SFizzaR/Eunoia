import { useState, useCallback } from "react";
import { UPLOAD_CONFIG } from "../constants/journal";
import { Attachment } from "@/types/attachment";
import { logout } from "../lib/auth";
import { UseAttachmentsReturn } from "@/types/attachment";

export const useAttachments = (): UseAttachmentsReturn => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleError = (err: unknown, defaultMessage: string) => {
    return err instanceof Error ? err.message : defaultMessage;
  };

  const clearErrors = useCallback(() => {
    setUploadError(null);
    setDeleteError(null);
  }, []);

  const fetchAttachments = useCallback(
    async (entryId: number | string, token: string) => {
      try {
        setLoadingAttachments(true);
        const response = await fetch(
          `http://localhost:3000/entries/${entryId}/attachments`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          logout();
          return;
        }

        // 404 means no attachments (this is normal)
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
    },
    [],
  );

  const uploadFiles = useCallback(
    async (files: FileList | null, entryId: number | string, token: string) => {
      if (!files || files.length === 0) return;

      try {
        setUploadingFile(true);
        setUploadError(null);

        const formData = new FormData();
        Array.from(files).forEach((file) => {
          // Validate file size
          if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
            throw new Error(`File ${file.name} is too large. Max size: 50MB`);
          }
          formData.append("files", file);
        });

        const response = await fetch(
          `http://localhost:3000/entries/${entryId}/attachments`,
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
          throw new Error(error.message || "Failed to upload attachment");
        }

        // Refresh attachments list
        await fetchAttachments(entryId, token);
      } catch (err) {
        setUploadError(handleError(err, "Failed to upload attachment"));
      } finally {
        setUploadingFile(false);
      }
    },
    [fetchAttachments],
  );

  const deleteAttachment = useCallback((attachmentId: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  }, []);

  return {
    attachments,
    loadingAttachments,
    uploadingFile,
    uploadError,
    deleteError,
    fetchAttachments,
    uploadFiles,
    deleteAttachment,
    clearErrors,
  };
};
