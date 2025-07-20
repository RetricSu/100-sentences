import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDictationStorage } from '../hooks/useDictationStorage';
import { useSpeechContext } from './SpeechContext';
import { DictationDisplayUtils } from '../utils/dictationDisplay';

interface DictationContextType {
  // State
  isActive: boolean;
  currentSentenceIndex: number | null;
  activeInputs: Record<string, string>;
  storedInputs: Record<string, string>;
  isLoaded: boolean;
  
  // Actions
  activate: () => void;
  deactivate: () => void;
  setCurrentSentence: (index: number | null) => void;
  updateInput: (sentence: string, sentenceIndex: number, input: string) => void;
  onComplete: () => void;
}

const DictationContext = createContext<DictationContextType | null>(null);

interface DictationProviderProps {
  children: React.ReactNode;
}

export const DictationProvider: React.FC<DictationProviderProps> = ({ children }) => {
  const speech = useSpeechContext();
  const { getAllDictationInputs, isLoaded: isDictationStorageLoaded } = useDictationStorage();
  
  // Dictation state
  const [isActive, setIsActive] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null);
  const [activeInputs, setActiveInputs] = useState<Record<string, string>>({});
  const [storedInputs, setStoredInputs] = useState<Record<string, string>>({});

  // Activate dictation mode
  const activate = useCallback(() => {
    setIsActive(true);
    setCurrentSentenceIndex(null);
  }, []);

  // Deactivate dictation mode
  const deactivate = useCallback(() => {
    setIsActive(false);
    setCurrentSentenceIndex(null);
  }, []);

  // Set current sentence for dictation
  const setCurrentSentence = useCallback((index: number | null) => {
    setCurrentSentenceIndex(index);
  }, []);

  // Update input for a sentence
  const updateInput = useCallback((sentence: string, sentenceIndex: number, input: string) => {
    const sentenceId = DictationDisplayUtils.generateSentenceId(sentence.trim(), sentenceIndex);
    setActiveInputs(prev => ({
      ...prev,
      [sentenceId]: input
    }));
  }, []);

  // Handle dictation completion
  const onComplete = useCallback(() => {
    if (currentSentenceIndex !== null && currentSentenceIndex < speech.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      speech.jumpToSentence(currentSentenceIndex + 1);
    } else {
      setCurrentSentenceIndex(null);
    }
  }, [currentSentenceIndex, speech]);

  // Sync stored inputs when storage is loaded or dictation state changes
  useEffect(() => {
    if (isDictationStorageLoaded) {
      setStoredInputs(getAllDictationInputs());
    }
  }, [isDictationStorageLoaded, getAllDictationInputs, currentSentenceIndex, isActive]);

  const value: DictationContextType = {
    // State
    isActive,
    currentSentenceIndex,
    activeInputs,
    storedInputs,
    isLoaded: isDictationStorageLoaded,
    
    // Actions
    activate,
    deactivate,
    setCurrentSentence,
    updateInput,
    onComplete,
  };

  return (
    <DictationContext.Provider value={value}>
      {children}
    </DictationContext.Provider>
  );
};

export const useDictationContext = () => {
  const context = useContext(DictationContext);
  if (!context) {
    throw new Error('useDictationContext must be used within a DictationProvider');
  }
  return context;
}; 
