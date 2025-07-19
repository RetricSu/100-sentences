import { useCallback, useMemo } from 'react';
import { TextProcessor } from '../services/textProcessor';
import { defaultText } from '../data/const';

interface UseTextManagementProps {
  speech: any;
  isDictationMode: boolean;
}

export const useTextManagement = ({ speech, isDictationMode }: UseTextManagementProps) => {
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

  return {
    // State
    processedHtml,
    defaultText,
    
    // Actions
    handleTextUpdate,
  };
}; 
