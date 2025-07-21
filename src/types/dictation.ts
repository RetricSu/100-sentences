/**
 * Type definitions for dictation-related functionality
 */

// Storage types
export interface DictationStorage {
  [sentenceId: string]: string;
}

// Wrong word book types
export interface WrongWordEntry {
  id: string;
  word: string;
  sentenceContext: string[];
  textTitle: string;
  createdAt: Date;
  practiceCount: number;
  lastPracticed?: Date;
}

export interface WrongWordBook {
  [textId: string]: {
    textTitle: string;
    entries: WrongWordEntry[];
  };
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
  onInputChange?: (input: string) => void;
  initialInput?: string;
  className?: string;
}

export interface DictationSentenceRendererProps {
  sentences: string[];
  dictationSentenceIndex: number | null;
  currentSentenceIndex: number;
  isSpeaking: boolean;
  storedInputs: DictationStorage;
  activeInputs: DictationStorage;
  onInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
  onDictationComplete: () => void;
}

export interface SentenceDisplayProps {
  sentence: string;
  sentenceIndex: number;
  isActive: boolean;
  isCurrentSentence: boolean;
  isSpeaking: boolean;
  storedInput: string;
  activeInput: string;
  onInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
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
