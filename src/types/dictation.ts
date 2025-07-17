/**
 * Type definitions for dictation-related functionality
 */

// Storage types
export interface DictationStorage {
  [sentenceId: string]: string;
}

export interface DictationProgressStats {
  totalCharacters: number;
  typedCharacters: number;
  correctCharacters: number;
  progressPercentage: number;
}

// Component prop types
export interface DictationInputProps {
  targetText: string;
  sentenceIndex: number;
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}

export interface DictationSentenceRendererProps {
  sentences: string[];
  dictationSentenceIndex: number | null;
  currentSentenceIndex: number;
  isSpeaking: boolean;
  savedDictationInputs: DictationStorage;
  onDictationComplete: () => void;
}

export interface SentenceDisplayProps {
  sentence: string;
  sentenceIndex: number;
  isActive: boolean;
  isCurrentSentence: boolean;
  isSpeaking: boolean;
  savedInput: string;
  onDictationComplete: () => void;
}

// Display and rendering types
export interface CharacterDisplayOptions {
  showCursor?: boolean;
  cursorPosition?: number;
}

export interface DictationDisplayResult {
  elements: React.ReactNode[];
  stats: DictationProgressStats;
}

// Hook return types
export interface UseDictationStorageReturn {
  getDictationInput: (sentenceText: string, sentenceIndex: number) => string;
  saveDictationInput: (sentenceText: string, sentenceIndex: number, input: string) => void;
  clearDictationInput: (sentenceText: string, sentenceIndex: number) => void;
  clearAllDictationInputs: () => void;
  getAllDictationInputs: () => DictationStorage;
  isLoaded: boolean;
}

// Text processing types
export interface ProcessedTextOptions {
  currentSentenceIndex: number;
  isSpeaking: boolean;
}

export interface DictationProcessingOptions extends ProcessedTextOptions {
  dictationSentenceIndex?: number | null;
  savedDictationInputs?: DictationStorage;
}

// Validation types
export type DictationValidationResult = {
  isValid: boolean;
  errors: string[];
  completionPercentage: number;
}; 
