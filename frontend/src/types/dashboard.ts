export interface Emotion {
  emotionId: string;
  emotionName: string;
  animatedEmojiUrl: string;
  entryCount: number;
  color: string;
  category: "positive" | "neutral" | "negative";
}

export interface CategorizedEmotions {
  positive: Emotion[];
  neutral: Emotion[];
  negative: Emotion[];
}

export interface UseDashboardDataReturn {
  categorizedEmotions: CategorizedEmotions;
  draftCount: number;
  totalPublishedEntries: number;
  loading: boolean;
  error: string | null;
  fetchDashboardData: (token: string) => Promise<void>;
}

export interface UseProfileImageReturn {
  profileImage: string | null;
  uploading: boolean;
  deleting: boolean;
  error: string | null;
  setProfileImage: (image: string | null) => void;
  uploadProfileImage: (file: File, token: string) => Promise<void>;
  deleteProfileImage: (token: string) => Promise<void>;
  clearError: () => void;
}

export interface UseCoverImageReturn {
  coverImage: string | null;
  uploading: boolean;
  deleting: boolean;
  error: string | null;
  setCoverImage: (image: string | null) => void;
  uploadCoverImage: (file: File, token: string) => Promise<void>;
  deleteCoverImage: (token: string) => Promise<void>;
  clearError: () => void;
}

export interface DraftsFolderProps {
  draftCount: number;
  onViewDrafts: () => void;
}

export interface AddEntryButtonProps {
  onAddEntry: () => void;
}

export interface EmotionCardProps {
  emotion: Emotion;
  index: number;
  isLoaded: boolean;
  onViewEmotion: (emotionId: string) => void;
}

export interface EmotionSectionProps {
  title: string;
  color: string;
  emotions: Emotion[];
  isLoaded: boolean;
  onViewEmotion: (emotionId: string) => void;
}

export interface HeaderSectionProps {
  headerImage: string | null;
  currentDate: string;
  isLoaded: boolean;
  onHeaderImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHeaderImageDelete: () => void;
  uploading?: boolean;
  deleting?: boolean;
}

export interface ProfileSectionProps {
  userName: string;
  profileImage: string | null;
  publishedCount: number;
  draftCount: number;
  isLoaded: boolean;
  onProfileImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileImageDelete: () => void;
  uploading?: boolean;
  deleting?: boolean;
}
