import { Loader, Sparkles } from "lucide-react";
import styles from "../app/Journal/journal.module.css";
import { ActionButtonsProps } from "@/types/actionButton";

/**
 * Action buttons for journal entry operations
 */
export function ActionButtons({
  saving,
  reflectionLoading,
  onSaveDraft,
  onPublish,
  onReflect,
  onDelete,
  hasContent,
  hasEntry,
  isLocked,
}: ActionButtonsProps) {
  const draftDisabled = saving || !hasContent || isLocked;
  const publishDisabled = saving || !hasContent || isLocked;
  const reflectDisabled = reflectionLoading || !hasContent || isLocked;
  const deleteDisabled = !hasEntry || saving;

  return (
    <div className={styles.actions}>
      <button
        className={styles.draftButton}
        onClick={onSaveDraft}
        disabled={draftDisabled}
        title={isLocked ? "Published entries cannot be edited" : ""}
        aria-busy={saving}
      >
        {saving ? (
          <>
            <Loader size={18} className="animate-spin" aria-hidden="true" />
            Saving...
          </>
        ) : (
          "Save as Draft"
        )}
      </button>

      <button
        className={styles.publishButton}
        onClick={onPublish}
        disabled={publishDisabled}
        title={isLocked ? "Entry already published" : ""}
        aria-busy={saving}
      >
        {saving ? (
          <>
            <Loader size={18} className="animate-spin" aria-hidden="true" />
            Publishing...
          </>
        ) : (
          "Publish Entry"
        )}
      </button>

      <button
        className={styles.reflectButton}
        onClick={onReflect}
        disabled={reflectDisabled}
        title={
          !hasContent
            ? "Write something first"
            : isLocked
              ? "Published entries cannot be reflected on"
              : "Generate AI reflection"
        }
        aria-busy={reflectionLoading}
      >
        {reflectionLoading ? (
          <>
            <Loader size={18} className="animate-spin" aria-hidden="true" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Reflect on this
          </>
        )}
      </button>

      <button
        className={styles.deleteButton}
        onClick={onDelete}
        disabled={deleteDisabled}
        title={!hasEntry ? "Entry must be saved first" : ""}
        aria-busy={saving}
      >
        {saving ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
