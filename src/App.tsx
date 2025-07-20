import React, { useState, useEffect, useCallback } from "react";
import { useDictationStorage } from "./hooks/useDictationStorage";
import { useEventHandlers } from "./hooks/useEventHandlers";
import { useTextManagement } from "./hooks/useTextManagement";
import { AppLayout } from "./components/AppLayout";
import { DictationDisplayUtils } from "./utils/dictationDisplay";
import { useAppStateContext } from "./contexts/AppStateContext";
import { useSpeechContext } from "./contexts/SpeechContext";
import { useDictionaryContext } from "./contexts/DictionaryContext";

function App() {
  // Get app state from context
  const appState = useAppStateContext();
  
  // Get speech from context
  const speech = useSpeechContext();

  // Get dictionary from context
  const {
    lookupWord,
    loading: dictionaryLoading,
    error: dictionaryError,
  } = useDictionaryContext();

  // Dictation storage hook
  const { getAllDictationInputs, isLoaded: isDictationStorageLoaded } = useDictationStorage();
  
  // Text management
  const textManagement = useTextManagement({
    isDictationMode: appState.isDictationMode,
  });

  // Event handlers
  const eventHandlers = useEventHandlers({
    speech,
    isDictationMode: appState.isDictationMode,
    dictationSentenceIndex: appState.dictationSentenceIndex,
    appState: {
      showDictionary: appState.showDictionary,
      setDictationSentence: appState.setDictationSentence,
      setHotkeyFeedback: appState.setHotkeyFeedback,
    },
    lookupWord,
  });

  // Reactive state for dictation inputs to ensure real-time updates
  const [dictationInputs, setDictationInputs] = useState<Record<string, string>>({});
  
  // Real-time typed text for all sentences (not just the active one)
  const [realTimeInputs, setRealTimeInputs] = useState<Record<string, string>>({});

  // Handle word click with dictionary lookup
  const handleWordClick = useCallback(async (event: React.MouseEvent) => {
    const result = await eventHandlers.handleWordClick(event);
    if (result) {
      appState.setDictionaryDataValue(result);
    }
  }, [eventHandlers, appState]);

  // Combined click handler
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      handleWordClick(event);
      eventHandlers.handleSentenceClick(event);
    },
    [handleWordClick, eventHandlers]
  );

  const handleDictationComplete = useCallback(() => {
    // Auto-advance to next sentence or reset
    if (appState.dictationSentenceIndex !== null && appState.dictationSentenceIndex < speech.sentences.length - 1) {
      appState.setDictationSentence(appState.dictationSentenceIndex + 1);
      speech.jumpToSentence(appState.dictationSentenceIndex + 1);
    } else {
      appState.setDictationSentence(null);
    }
  }, [appState.dictationSentenceIndex, speech, appState]);

  // Handle real-time input updates for all sentences
  const handleRealTimeInputUpdate = useCallback((sentence: string, sentenceIndex: number, input: string) => {
    const sentenceId = DictationDisplayUtils.generateSentenceId(sentence.trim(), sentenceIndex);
    setRealTimeInputs(prev => ({
      ...prev,
      [sentenceId]: input
    }));
  }, []);

  // Sync dictation inputs in real-time
  useEffect(() => {
    if (isDictationStorageLoaded) {
      setDictationInputs(getAllDictationInputs());
    }
  }, [isDictationStorageLoaded, getAllDictationInputs, appState.dictationSentenceIndex, appState.isDictationMode]);

  // Initialize with default text if no text is loaded
  useEffect(() => {
    if (!speech.originalText.trim() && textManagement.defaultText.trim()) {
      textManagement.handleTextUpdate(textManagement.defaultText);
    }
  }, [speech.originalText, textManagement]);

  // Global hotkey for playing current sentence
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      eventHandlers.handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [eventHandlers]);

  if (!speech.isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">浏览器不支持</h1>
          <p className="text-gray-600 leading-relaxed">
            抱歉，您的浏览器不支持语音合成功能。请使用最新版本的 Chrome 或 Edge
            浏览器以获得最佳体验。
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      // Settings props (simplified)
      showSettings={appState.showSettings}
      onTextUpdate={textManagement.handleTextUpdate}
      defaultText={textManagement.defaultText}
      displayText={speech.originalText}

      // Text renderer props
      processedHtml={textManagement.processedHtml}
      dictationInputs={dictationInputs}
      realTimeInputs={realTimeInputs}
      onRealTimeInputUpdate={handleRealTimeInputUpdate}
      onDictationComplete={handleDictationComplete}
      onClick={handleClick}

      // Dictionary popup props (simplified)
      dictionaryLoading={dictionaryLoading}
      dictionaryError={dictionaryError}
      onSpeak={speech.speak}
    />
  );
}

export default App;
