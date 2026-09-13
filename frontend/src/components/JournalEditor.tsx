import { useRef } from "react";
import { Paperclip } from "lucide-react";
import styles from "../app/Journal/journal.module.css";
import { JournalEditorProps } from "@/types/journal";

export function JournalEditor({
  thoughts,
  onThoughtsChange,
  onFileUpload,
  uploadError,
  deleteError,
  uploadingFile,
  isLocked,
  hasEntry,
  wordCount,
}: JournalEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getUploadButtonTitle = (): string => {
    if (isLocked) return "Published entries cannot be edited";
    if (!hasEntry) return "Save as draft first to add attachments";
    return "Add attachment";
  };

  return (
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
          onChange={(e) => onThoughtsChange(e.target.value)}
          placeholder="Dear journal..."
          aria-label="Journal entry"
          disabled={isLocked}
        />

        <div className={styles.paperFooter}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              className={styles.attachmentButton}
              disabled={isLocked || uploadingFile}
              onClick={handleClickAttachment}
              title={getUploadButtonTitle()}
            >
              <Paperclip size={17} />
              {uploadingFile ? "Uploading..." : "Add attachment"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => onFileUpload(e.target.files)}
              accept="image/*,audio/*,.pdf"
              disabled={uploadingFile}
              aria-label="Upload file"
            />

            {uploadError && (
              <span
                style={{ color: "#d32f2f", fontSize: "0.875rem" }}
                role="alert"
              >
                {uploadError}
              </span>
            )}

            {deleteError && (
              <span
                style={{ color: "#d32f2f", fontSize: "0.875rem" }}
                role="alert"
              >
                {deleteError}
              </span>
            )}
          </div>

          <span aria-live="polite">{wordCount} words</span>
        </div>
      </div>
    </section>
  );
}
