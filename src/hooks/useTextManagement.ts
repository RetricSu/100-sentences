import { useCallback, useMemo } from 'react';
import { useLocalStorage, SavedText as SavedTextType } from './useLocalStorage';
import { TextProcessor } from '../services/textProcessor';
import { defaultText } from '../data/const';

interface UseTextManagementProps {
  speech: any;
  isDictationMode: boolean;
}

export const useTextManagement = ({ speech, isDictationMode }: UseTextManagementProps) => {
  const {
    savedTexts: storedTexts,
    loading: savedTextsLoading,
    saveText,
    deleteText,
    clearAllTexts,
  } = useLocalStorage();

  // Generate processed HTML for normal mode only (dictation mode uses React components)
  const processedHtml = useMemo(() => {
    if (!speech.originalText.trim() || isDictationMode) return "";
    
    return TextProcessor.processTextToHTML(speech.originalText, {
      currentSentenceIndex: speech.currentSentenceIndex,
      isSpeaking: speech.isSpeaking,
    });
  }, [speech.originalText, speech.currentSentenceIndex, speech.isSpeaking, isDictationMode]);

  // Handle text updates
  const handleTextUpdate = useCallback((text: string) => {
    speech.setText(text);
  }, [speech]);

  // Handle saving text
  const handleSaveText = useCallback(
    (text: string, title?: string) => {
      saveText(text, title);
    },
    [saveText]
  );

  // Load saved text
  const handleLoadText = useCallback(
    (savedText: SavedTextType) => {
      handleTextUpdate(savedText.content);
    },
    [handleTextUpdate]
  );

  // Delete saved text
  const handleDeleteText = useCallback(
    (id: string) => {
      if (confirm("Are you sure you want to delete this saved text?")) {
        deleteText(id);
      }
    },
    [deleteText]
  );

  // Clear all saved texts
  const handleClearAllTexts = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to delete all saved texts? This action cannot be undone."
      )
    ) {
      clearAllTexts();
    }
  }, [clearAllTexts]);

  // Auto-load latest saved text on app initialization
  const autoLoadLatestText = useCallback(() => {
    if (!savedTextsLoading && storedTexts.length > 0 && !speech.originalText.trim()) {
      const latestText = storedTexts[0];
      console.log('Auto-loading latest saved text:', latestText.title);
      handleTextUpdate(latestText.content);
    }
  }, [savedTextsLoading, storedTexts, speech.originalText, handleTextUpdate]);

  // Initialize with default text if no saved texts
  const initializeWithDefaultText = useCallback(() => {
    if (!savedTextsLoading && storedTexts.length === 0 && !speech.originalText.trim()) {
      handleTextUpdate(defaultText);
    }
  }, [savedTextsLoading, storedTexts.length, handleTextUpdate, speech.originalText]);

  return {
    // State
    storedTexts,
    savedTextsLoading,
    processedHtml,
    defaultText,
    
    // Actions
    handleTextUpdate,
    handleSaveText,
    handleLoadText,
    handleDeleteText,
    handleClearAllTexts,
    autoLoadLatestText,
    initializeWithDefaultText,
  };
}; 
