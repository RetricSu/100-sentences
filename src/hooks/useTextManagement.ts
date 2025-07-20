import { useCallback, useMemo } from 'react';
import { TextProcessor } from '../services/textProcessor';
import { defaultText } from '../data/const';
import { useSpeechContext } from '../contexts/SpeechContext';

export const useTextManagement = () => {
  const speech = useSpeechContext();
  
  // Generate processed HTML for reading mode
  const processedHtml = useMemo(() => {
    if (!speech.originalText.trim()) return "";
    
    return TextProcessor.processTextToHTML(speech.originalText, {
      currentSentenceIndex: speech.currentSentenceIndex,
      isSpeaking: speech.isSpeaking,
    });
  }, [speech.originalText, speech.currentSentenceIndex, speech.isSpeaking]);

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
