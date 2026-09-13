export interface EmotionType {
  id: string;
  emotionName: string;
  emoji: string;
}

export interface EntryType {
  id: string;
  content: string;
  date: string;
  title?: string;
  isDraft: boolean;
  emotions: EmotionType[];
  wordCount: number;
  attachmentCount: number;
  isAiDetected?: boolean;
}

export interface FetchedEmotion {
  emotionId: string;
  emotionName: string;
  emoji: string;
}

export interface EntriesResponse {
  entries: EntryType[];
  emotion?: FetchedEmotion;
}
