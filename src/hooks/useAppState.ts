import { useState, useCallback } from 'react';

export interface AppState {
  showSettings: boolean;
  isDictationMode: boolean;
  dictationSentenceIndex: number | null;
  dictionaryVisible: boolean;
  currentWord: string;
  dictionaryData: any | null;
  hotkeyPressed: boolean;
}

export const useAppState = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isDictationMode, setIsDictationMode] = useState(false);
  const [dictationSentenceIndex, setDictationSentenceIndex] = useState<number | null>(null);
  const [dictionaryVisible, setDictionaryVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [dictionaryData, setDictionaryData] = useState<any | null>(null);
  const [hotkeyPressed, setHotkeyPressed] = useState(false);

  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings]);

  const toggleDictationMode = useCallback(() => {
    setIsDictationMode(!isDictationMode);
    setDictationSentenceIndex(null);
  }, [isDictationMode]);

  const setDictationSentence = useCallback((index: number | null) => {
    setDictationSentenceIndex(index);
  }, []);

  const showDictionary = useCallback((word: string) => {
    setCurrentWord(word);
    setDictionaryVisible(true);
    setDictionaryData(null);
  }, []);

  const hideDictionary = useCallback(() => {
    setDictionaryVisible(false);
    setCurrentWord("");
    setDictionaryData(null);
  }, []);

  const setDictionaryDataValue = useCallback((data: any) => {
    setDictionaryData(data);
  }, []);

  const setHotkeyFeedback = useCallback((pressed: boolean) => {
    setHotkeyPressed(pressed);
  }, []);

  return {
    // State
    showSettings,
    isDictationMode,
    dictationSentenceIndex,
    dictionaryVisible,
    currentWord,
    dictionaryData,
    hotkeyPressed,
    
    // Actions
    toggleSettings,
    toggleDictationMode,
    setDictationSentence,
    showDictionary,
    hideDictionary,
    setDictionaryDataValue,
    setHotkeyFeedback,
  };
}; 
