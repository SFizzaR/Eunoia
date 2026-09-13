import { Mood } from "./moods";

export interface ReflectionData {
  reflection: string;
  advice: string | null;
}

export interface UseReflectionReturn {
  generatedReflection: ReflectionData | null;
  reflectionLoading: boolean;
  reflectionError: string | null;
  showReflection: boolean;
  setShowReflection: (show: boolean) => void;
  fetchExistingReflection: (
    entryId: number | string,
    token: string,
  ) => Promise<void>;
  generateReflection: (
    entryId: number,
    content: string,
    emotions: string[],
    token: string,
  ) => Promise<void>;
  clearReflection: () => void;
}

export interface ReflectionSectionProps {
  show: boolean;
  reflectionLoading: boolean;
  generatedReflection: ReflectionData | null;
  detectedMoods: string[];
  moods: Mood[];
  isLocked: boolean;
  onRegenerateReflection: () => void;
  onGenerateNewReflection: () => void;
}
