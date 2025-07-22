import { useState, useCallback } from 'react';
import { useLocalStorage, SavedText } from './useLocalStorage';
import { useDictationStorage } from './useDictationStorage';
import useLocalStorageState from 'use-local-storage-state';
import { useNotification } from './useNotification';

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
  
  // Notification system
  const notification = useNotification();

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
    notification.success("文本保存成功", "文本已成功保存到本地存储");
  }, [displayText, saveTextTitle, saveText, notification]);

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
    notification.warning(
      '确认清除',
      '确定要清除所有默写进度吗？此操作无法撤销。',
      {
        duration: 0, // No auto-dismiss
        action: {
          label: '确认清除',
          onClick: () => {
            clearAllDictationInputs();
            notification.success('清除成功', '已清除所有默写进度');
          }
        }
      }
    );
  }, [clearAllDictationInputs, notification]);

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
