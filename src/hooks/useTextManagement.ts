import { useCallback } from 'react';
import { defaultText } from '../data/const';
import { useSpeechContext } from '../contexts/SpeechContext';

export const useTextManagement = () => {
  const speech = useSpeechContext();
  
  // Handle text updates
  const handleTextUpdate = useCallback((text: string) => {
    speech.setText(text);
  }, [speech]);

  return {
    // State
    defaultText,
    
    // Actions
    handleTextUpdate,
  };
}; 
