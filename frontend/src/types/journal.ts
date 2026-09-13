export interface EmotionData {
  emotionId: string;
  userSelected: boolean;
  aiDetected: boolean;
  confidence?: number;
}

export interface JournalEntryData {
  id: number;
  content: string;
  isDraft: boolean;
  emotions?: any[];
}

export interface UseJournalEntryReturn {
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  deleteError: string | null;
  deleteSuccess: boolean;
  entry: JournalEntryData | null;
  fetchEntry: (entryId: string, token: string) => Promise<void>;
  saveDraft: (
    content: string,
    emotions: EmotionData[],
    entryId: number | null,
    token: string,
  ) => Promise<number | null>;
  publishEntry: (
    content: string,
    emotions: EmotionData[],
    entryId: number | null,
    token: string,
  ) => Promise<void>;
  deleteEntry: (entryId: number, token: string) => Promise<void>;
  clearMessages: () => void;
}

export interface JournalEditorProps {
  thoughts: string;
  onThoughtsChange: (content: string) => void;
  onFileUpload: (files: FileList | null) => void;
  uploadError: string | null;
  deleteError: string | null;
  uploadingFile: boolean;
  isLocked: boolean;
  hasEntry: boolean;
  wordCount: number;
}
