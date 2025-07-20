import { useState, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export interface AppState {
  showSettings: boolean;
  isDictationMode: boolean;
  dictionaryVisible: boolean;
  currentWord: string;
  dictionaryData: any | null;
  hotkeyPressed: boolean;
  lastSelectedText: string;
}

export interface AppStateActions {
  toggleSettings: () => void;
  toggleDictationMode: () => void;
  showDictionary: (word: string) => void;
  hideDictionary: () => void;
  setDictionaryDataValue: (data: any) => void;
  setHotkeyFeedback: (pressed: boolean) => void;
  setLastSelectedText: (text: string) => void;
  getLastSelectedText: () => string;
}

export type UseAppStateReturn = AppState & AppStateActions;

export const useAppState = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isDictationMode, setIsDictationMode] = useState(false);
  const [dictionaryVisible, setDictionaryVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [dictionaryData, setDictionaryData] = useState<any | null>(null);
  const [hotkeyPressed, setHotkeyPressed] = useState(false);

  // Persistent storage for last selected text
  const [lastSelectedText, setLastSelectedText] = useLocalStorageState('last-selected-text', { 
    defaultValue: "" 
  });

  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings]);

  const toggleDictationMode = useCallback(() => {
    setIsDictationMode(!isDictationMode);
  }, [isDictationMode]);

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

  // Set last selected text (automatically persists to localStorage)
  const setLastSelectedTextAction = useCallback((text: string) => {
    setLastSelectedText(text);
  }, [setLastSelectedText]);

  // Get last selected text
  const getLastSelectedText = useCallback(() => {
    return lastSelectedText;
  }, [lastSelectedText]);

  return {
    // State
    showSettings,
    isDictationMode,
    dictionaryVisible,
    currentWord,
    dictionaryData,
    hotkeyPressed,
    lastSelectedText,
    
    // Actions
    toggleSettings,
    toggleDictationMode,
    showDictionary,
    hideDictionary,
    setDictionaryDataValue,
    setHotkeyFeedback,
    setLastSelectedText: setLastSelectedTextAction,
    getLastSelectedText,
  };
}; 
