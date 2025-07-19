import { useState, useCallback } from 'react';
import { useLocalStorage, SavedText } from './useLocalStorage';
import { useDictationStorage } from './useDictationStorage';
import useLocalStorageState from 'use-local-storage-state';

interface UseSettingsPanelProps {
  onTextUpdate: (text: string) => void;
  defaultText?: string;
  displayText: string;
}

export const useSettingsPanel = ({ onTextUpdate, defaultText = "", displayText }: UseSettingsPanelProps) => {
  // Internal state for text input
  const [inputText, setInputText] = useState("");
  const [saveTextTitle, setSaveTextTitle] = useState("");
  const [showSavedTexts, setShowSavedTexts] = useState(true);

  // Saved texts management
  const {
    savedTexts,
    loading: savedTextsLoading,
    saveText,
    deleteText,
    clearAllTexts,
  } = useLocalStorage();

  // Dictation storage
  const { clearAllDictationInputs } = useDictationStorage();

  // Voice and rate settings with persistence
  const [selectedVoiceInfo, setSelectedVoiceInfo] = useLocalStorageState<{name: string, lang: string} | null>('tts-voice', { defaultValue: null });
  const [rate, setRate] = useLocalStorageState('tts-rate', { defaultValue: 0.9 });

  // Handle text conversion
  const handleConvert = useCallback(() => {
    const textToProcess = inputText.trim() || defaultText;
    onTextUpdate(textToProcess);
  }, [inputText, defaultText, onTextUpdate]);

  // Handle text saving
  const handleSaveText = useCallback(() => {
    if (!displayText.trim()) return;
    
    const title = saveTextTitle.trim() || undefined;
    saveText(displayText, title);
    setSaveTextTitle("");
    
    // Show a brief success message
    alert("Text saved successfully!");
  }, [displayText, saveTextTitle, saveText]);

  // Handle loading saved text
  const handleLoadText = useCallback((savedText: SavedText) => {
    // Update internal input text to match loaded text
    setInputText(savedText.content);
    // Notify parent component
    onTextUpdate(savedText.content);
  }, [onTextUpdate]);

  // Handle voice selection
  const handleVoiceChange = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoiceInfo({ name: voice.name, lang: voice.lang });
  }, [setSelectedVoiceInfo]);

  // Handle rate change
  const handleRateChange = useCallback((newRate: number) => {
    setRate(newRate);
  }, [setRate]);

  // Toggle saved texts visibility
  const toggleSavedTexts = useCallback(() => {
    setShowSavedTexts(!showSavedTexts);
  }, [showSavedTexts]);

  // Handle dictation inputs clearing
  const handleClearDictationInputs = useCallback(() => {
    if (confirm("Are you sure you want to clear all dictation progress? This action cannot be undone.")) {
      clearAllDictationInputs();
    }
  }, [clearAllDictationInputs]);

  return {
    // Internal state
    inputText,
    setInputText,
    saveTextTitle,
    setSaveTextTitle,
    showSavedTexts,
    
    // Saved texts
    savedTexts,
    savedTextsLoading,
    
    // Voice and rate settings
    selectedVoiceInfo,
    rate,
    
    // Actions
    handleConvert,
    handleSaveText,
    handleLoadText,
    handleVoiceChange,
    handleRateChange,
    toggleSavedTexts,
    handleClearDictationInputs,
    deleteText,
    clearAllTexts,
  };
}; 
