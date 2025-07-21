/**
 * Type definitions for recitation-related functionality
 */

// Storage types
export interface RecitationStorage {
  [sentenceId: string]: string;
}

export interface UseRecitationStorageReturn {
  getRecitationInput: (sentenceText: string, sentenceIndex: number) => string;
  saveRecitationInput: (sentenceText: string, sentenceIndex: number, input: string) => void;
  clearRecitationInput: (sentenceText: string, sentenceIndex: number) => void;
  clearAllRecitationInputs: () => void;
  getAllRecitationInputs: () => RecitationStorage;
  isLoaded: boolean;
}

// Component prop types
export interface RecitationInputProps {
  targetText: string;
  sentenceIndex: number;
  isVisible: boolean;
  onComplete?: () => void;
  onInputChange?: (input: string) => void;
  initialInput?: string;
  className?: string;
  isListening?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
}

export interface RecitationSentenceRendererProps {
  sentences: string[];
  recitationSentenceIndex: number | null;
  currentSentenceIndex: number;
  isSpeaking: boolean;
  storedInputs: Record<string, string>;
  activeInputs: Record<string, string>;
  onRecitationComplete: () => void;
}

export interface SentenceDisplayProps {
  sentence: string;
  sentenceIndex: number;
  isActive: boolean;
  isCurrentSentence: boolean;
  isSpeaking: boolean;
  storedInput: string;
  activeInput: string;
  onRecitationComplete: () => void;
}

export interface RecitationValidationResult {
  accuracy: number;
  isComplete: boolean;
  correctWords: number;
  totalWords: number;
  userWords: number;
  partialWords?: number;
}

export interface RecitationProgressStats {
  totalSentences: number;
  completedSentences: number;
  completionRate: number;
  averageAccuracy: number;
  overallAccuracy: number;
  totalWords: number;
  totalCorrectWords: number;
  totalPartialWords?: number;
} 
