import { useCallback } from 'react';
import { useDictionary } from './useDictionary';
import { UseAppStateReturn } from './useAppState';

interface UseHeaderProps {
  appState: UseAppStateReturn;
  speech: any; // Accept speech instance from parent
}

export const useHeader = ({ appState, speech }: UseHeaderProps) => {
  // Dictionary hook
  const {
    dictionaryLoaded,
    dictionarySize,
    isLoading: isDictionaryLoading,
    loadingProgress,
  } = useDictionary();

  // Navigation handlers
  const handlePreviousSentence = useCallback(() => {
    if (speech.currentSentenceIndex > 0) {
      speech.jumpToSentence(speech.currentSentenceIndex - 1);
    }
  }, [speech]);

  const handleNextSentence = useCallback(() => {
    if (speech.currentSentenceIndex < speech.sentences.length - 1) {
      speech.jumpToSentence(speech.currentSentenceIndex + 1);
    }
  }, [speech]);

  const handleSpeakCurrentSentence = useCallback(() => {
    speech.speakCurrentSentence();
  }, [speech]);

  // Reading control handlers
  const handleStopReading = useCallback(() => {
    if (speech.isSpeaking) {
      speech.stop();
    }
  }, [speech]);

  const handleStartReading = useCallback(() => {
    if (!speech.isSpeaking) {
      speech.speakAll(speech.currentSentenceIndex);
    }
  }, [speech]);

  return {
    // Dictionary status
    dictionaryLoaded,
    dictionarySize,
    isDictionaryLoading,
    loadingProgress,
    
    // Sentence navigation
    sentences: speech.sentences,
    currentSentenceIndex: speech.currentSentenceIndex,
    handlePreviousSentence,
    handleNextSentence,
    handleSpeakCurrentSentence,
    
    // Reading controls
    isSpeaking: speech.isSpeaking,
    hasText: speech.originalText.trim().length > 0,
    handleStopReading,
    handleStartReading,
    
    // Dictation mode
    isDictationMode: appState.isDictationMode,
    
    // Toggle functions
    onToggleSettings: appState.toggleSettings,
    onToggleDictationMode: appState.toggleDictationMode,
  };
}; 
