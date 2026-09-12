export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface AttachmentListProps {
  attachments: Attachment[];
  entryId: number;
  token: string;
  onDeleteSuccess: (attachmentId: number) => void;
  disabled?: boolean;
}

export interface UseAttachmentsReturn {
  attachments: Attachment[];
  loadingAttachments: boolean;
  uploadingFile: boolean;
  uploadError: string | null;
  deleteError: string | null;
  fetchAttachments: (entryId: number | string, token: string) => Promise<void>;
  uploadFiles: (
    files: FileList | null,
    entryId: number | string,
    token: string,
  ) => Promise<void>;
  deleteAttachment: (attachmentId: number) => void;
  clearErrors: () => void;
}
