import { useCallback, useEffect, useRef } from 'react';
import { defaultText } from '../data/const';
import { useSpeechContext } from '../contexts/SpeechContext';
import { useAppStateContext } from '../contexts/AppStateContext';

export const useTextManagement = () => {
  const speech = useSpeechContext();
  const appState = useAppStateContext();
  const initializedRef = useRef(false);
  
  // Handle text updates
  const handleTextUpdate = useCallback((text: string) => {
    speech.setText(text);
    // Save the selected text to app state for persistence
    appState.setLastSelectedText(text);
  }, [speech, appState]);

  // Load last selected text on initialization
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    initializedRef.current = true;

    const lastText = appState.getLastSelectedText();
    if (!speech.originalText.trim() && lastText.trim()) {
      // Load the last selected text if available
      handleTextUpdate(lastText);
    } else if (!speech.originalText.trim() && defaultText.trim()) {
      // Fall back to default text if no last selected text
      handleTextUpdate(defaultText);
    }
  }, []); // Only run on mount

  return {
    // State
    defaultText,
    
    // Actions
    handleTextUpdate,
  };
}; 
