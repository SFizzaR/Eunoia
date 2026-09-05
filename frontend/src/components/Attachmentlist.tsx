"use client";

import { useState } from "react";
import { X, Play, Download, File, Music, FileText, Image } from "lucide-react";
import styles from "./Attachmentlist.module.css";
import { FileViewer } from "./Fileviewer";

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface AttachmentListProps {
  attachments: Attachment[];
  entryId: number;
  token: string;
  onDeleteSuccess: (attachmentId: number) => void;
  disabled?: boolean;
}

export function AttachmentList({
  attachments,
  entryId,
  token,
  onDeleteSuccess,
  disabled = false,
}: AttachmentListProps) {
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  if (attachments.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image size={18} />;
    if (fileType.startsWith("audio/")) return <Music size={18} />;
    if (fileType === "application/pdf") return <FileText size={18} />;
    return <File size={18} />;
  };

  const handleDelete = async (attachmentId: number) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      setDeleting(attachmentId);
      const response = await fetch(
        `http://localhost:3000/attachments/${attachmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete attachment");
      }

      onDeleteSuccess(attachmentId);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete attachment",
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className={styles.attachmentContainer}>
        <h3 className={styles.heading}>
          📎 Attachments ({attachments.length})
        </h3>

        <div className={styles.tableWrapper}>
          <table className={styles.fileTable}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((attachment) => (
                <tr key={attachment.id} className={styles.fileRow}>
                  {/* File Name & Icon */}
                  <td className={styles.fileName}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileIcon}>
                        {getFileIcon(attachment.fileType)}
                      </span>
                      <span
                        className={styles.nameText}
                        onClick={() => setSelectedFile(attachment)}
                        title="Click to preview"
                      >
                        {attachment.fileName}
                      </span>
                    </div>
                  </td>

                  {/* File Type */}
                  <td className={styles.fileType}>
                    {attachment.fileType.split("/")[1]?.toUpperCase() ||
                      "Unknown"}
                  </td>

                  {/* File Size */}
                  <td className={styles.fileSize}>
                    {formatFileSize(attachment.fileSize)}
                  </td>

                  {/* Actions */}
                  <td className={styles.actions}>
                    <button
                      className={styles.previewBtn}
                      onClick={() => setSelectedFile(attachment)}
                      title="Preview"
                      disabled={disabled}
                    >
                      <Play size={16} />
                    </button>
                    <button
                      className={styles.downloadBtn}
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = attachment.fileUrl;
                        link.download = attachment.fileName;
                        link.click();
                      }}
                      title="Download"
                      disabled={disabled}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(attachment.id)}
                      disabled={disabled || deleting === attachment.id}
                      title="Delete"
                    >
                      {deleting === attachment.id ? (
                        <span className={styles.spinner}>⏳</span>
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </>
  );
}
