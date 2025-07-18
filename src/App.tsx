import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSpeech } from "./hooks/useSpeech";
import { useDictionary } from "./hooks/useDictionary";
import { useDictationStorage } from "./hooks/useDictationStorage";
import {
  useLocalStorage,
  SavedText as SavedTextType,
} from "./hooks/useLocalStorage";
import { DictionaryPopup } from "./components/DictionaryPopup";
import { Header } from "./components/Header";
import { SettingsPanel } from "./components/SettingsPanel";
import { DictationSentenceRenderer } from "./components/DictationSentenceRenderer";
import { DictionaryEntry } from "./types/index";
import { defaultText } from "./data/const";
import { TextProcessor } from "./services/textProcessor";
import { DictationDisplayUtils } from "./utils/dictationDisplay";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [isDictationMode, setIsDictationMode] = useState(false);
  const [dictationSentenceIndex, setDictationSentenceIndex] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Remove dictationRootRef - no longer needed

  // Dictionary popup state
  const [dictionaryVisible, setDictionaryVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry | null>(null);

  // Speech hook - single source of truth for text and speech state
  const speech = useSpeech();

  // Dictionary hook
  const {
    lookupWord,
    loading: dictionaryLoading,
    error: dictionaryError,
    dictionaryLoaded,
    dictionarySize,
    loadingProgress,
    isLoading: isDictionaryLoading,
  } = useDictionary();

  // Local storage hook
  const {
    savedTexts: storedTexts,
    loading: savedTextsLoading,
    saveText,
    deleteText,
    clearAllTexts,
  } = useLocalStorage();

  // Dictation storage hook
  const { clearAllDictationInputs, getAllDictationInputs, isLoaded: isDictationStorageLoaded } = useDictationStorage();
  
  // Reactive state for dictation inputs to ensure real-time updates
  const [dictationInputs, setDictationInputs] = useState<Record<string, string>>({});
  
  // Real-time typed text for all sentences (not just the active one)
  const [realTimeInputs, setRealTimeInputs] = useState<Record<string, string>>({});

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

  // Handle word clicks
  const handleWordClick = useCallback(
    async (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("word")) {
        const word = TextProcessor.extractCleanWord(target.textContent || "");
        if (!word) return;

        // Speak the word
        speech.speak(word);

        // Show dictionary popup
        setCurrentWord(word);
        setDictionaryVisible(true);
        setDictionaryData(null);

        // Lookup word
        try {
          const result = await lookupWord(word);
          setDictionaryData(result);
        } catch (error) {
          console.error("Error looking up word:", error);
        }
      }
    },
    [speech, lookupWord]
  );

  // Handle sentence clicks
  const handleSentenceClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      // Only handle sentence clicks if not clicking on a word
      if (target.classList.contains("word")) return;

      const sentenceDiv = target.closest(".sentence, .current-sentence");
      if (sentenceDiv) {
        const sentenceIndex = parseInt(
          sentenceDiv.getAttribute("data-sentence-index") || "0"
        );
        
        if (sentenceIndex >= 0 && sentenceIndex < speech.sentences.length) {
          // Stop current speech if speaking
          if (speech.isSpeaking) {
            speech.stop();
          }
          
          if (isDictationMode) {
            // In dictation mode, set this sentence for dictation
            setDictationSentenceIndex(sentenceIndex);
            speech.jumpToSentence(sentenceIndex);
            // Still speak the sentence for audio reference
            setTimeout(() => {
              speech.speak(speech.sentences[sentenceIndex], sentenceIndex);
            }, 100);
          } else {
            // Normal mode - navigate to sentence and speak it
            speech.jumpToSentence(sentenceIndex);
            // Small delay to ensure stop takes effect
            setTimeout(() => {
              speech.speak(speech.sentences[sentenceIndex], sentenceIndex);
            }, 100);
          }
        }
      }
    },
    [speech, isDictationMode]
  );

  // Combined click handler
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      handleWordClick(event);
      handleSentenceClick(event);
    },
    [handleWordClick, handleSentenceClick]
  );

  // Close dictionary popup
  const closeDictionary = useCallback(() => {
    setDictionaryVisible(false);
    setCurrentWord("");
    setDictionaryData(null);
  }, []);

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

  // Clear all dictation inputs
  const handleClearDictationInputs = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear all dictation progress? This action cannot be undone."
      )
    ) {
      clearAllDictationInputs();
    }
  }, [clearAllDictationInputs]);

  // Header control handlers
  const handleSentenceNavigate = useCallback(
    (index: number) => {
      if (speech.isSpeaking) {
        speech.stop();
      }
      speech.jumpToSentence(index);
    },
    [speech]
  );

  const handleSpeakCurrentSentence = useCallback(() => {
    if (speech.isSpeaking) {
      speech.stop();
      setTimeout(() => {
        speech.speakCurrentSentence();
      }, 100);
    } else {
      speech.speakCurrentSentence();
    }
  }, [speech]);

  const handleToggleReading = useCallback(() => {
    if (speech.isSpeaking) {
      speech.stop();
    } else {
      speech.speakAll(speech.currentSentenceIndex);
    }
  }, [speech]);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings]);

  const handleToggleDictationMode = useCallback(() => {
    setIsDictationMode(!isDictationMode);
    // Reset dictation sentence when toggling mode
    setDictationSentenceIndex(null);
  }, [isDictationMode]);

  const handleDictationComplete = useCallback(() => {
    // Auto-advance to next sentence or reset
    if (dictationSentenceIndex !== null && dictationSentenceIndex < speech.sentences.length - 1) {
      setDictationSentenceIndex(dictationSentenceIndex + 1);
      speech.jumpToSentence(dictationSentenceIndex + 1);
    } else {
      setDictationSentenceIndex(null);
    }
  }, [dictationSentenceIndex, speech]);

  // Handle real-time input updates for all sentences
  const handleRealTimeInputUpdate = useCallback((sentence: string, sentenceIndex: number, input: string) => {
    const sentenceId = DictationDisplayUtils.generateSentenceId(sentence.trim(), sentenceIndex);
    setRealTimeInputs(prev => ({
      ...prev,
      [sentenceId]: input
    }));
  }, []);

  // Remove the entire manual React root management useEffect
  // This will be replaced with proper declarative rendering

  // Sync dictation inputs in real-time
  useEffect(() => {
    if (isDictationStorageLoaded) {
      setDictationInputs(getAllDictationInputs());
    }
  }, [isDictationStorageLoaded, getAllDictationInputs, dictationSentenceIndex, isDictationMode]);

  // Auto-load latest saved text on app initialization
  useEffect(() => {
    if (!savedTextsLoading && storedTexts.length > 0 && !speech.originalText.trim()) {
      const latestText = storedTexts[0];
      console.log('Auto-loading latest saved text:', latestText.title);
      handleTextUpdate(latestText.content);
    }
  }, [savedTextsLoading, storedTexts, speech.originalText, handleTextUpdate]);

  // Initialize with default text if no saved texts
  useEffect(() => {
    if (!savedTextsLoading && storedTexts.length === 0 && !speech.originalText.trim()) {
      handleTextUpdate(defaultText);
    }
  }, [savedTextsLoading, storedTexts.length, handleTextUpdate, speech.originalText]);

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
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <Header
        dictionaryLoaded={dictionaryLoaded}
        dictionarySize={dictionarySize}
        isDictionaryLoading={isDictionaryLoading}
        loadingProgress={loadingProgress}
        sentences={speech.sentences}
        currentSentenceIndex={speech.currentSentenceIndex}
        onSentenceNavigate={handleSentenceNavigate}
        onSpeakCurrentSentence={handleSpeakCurrentSentence}
        isSpeaking={speech.isSpeaking}
        hasText={speech.originalText.trim().length > 0}
        onToggleReading={handleToggleReading}
        onToggleSettings={handleToggleSettings}
        isDictationMode={isDictationMode}
        onToggleDictationMode={handleToggleDictationMode}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Settings Sidebar */}
        <div
          className={`transition-all duration-300 ${
            showSettings ? "w-80" : "w-0"
          } overflow-hidden flex-shrink-0`}
        >
          <div className="sticky top-24">
            <SettingsPanel
              onTextUpdate={handleTextUpdate}
              defaultText={defaultText}
              displayText={speech.originalText}
              savedTexts={storedTexts}
              savedTextsLoading={savedTextsLoading}
              onLoadText={handleLoadText}
              onDeleteText={handleDeleteText}
              onClearAllTexts={handleClearAllTexts}
              onSaveText={handleSaveText}
              voices={speech.voices}
              selectedVoice={speech.selectedVoice}
              onVoiceChange={speech.setSelectedVoice}
              rate={speech.rate}
              onRateChange={speech.setRate}
              onClearDictationInputs={handleClearDictationInputs}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="card p-8 lg:p-12">
            {isDictationMode && speech.originalText.trim() ? (
              // Dictation mode: Use React components for declarative rendering
              <div
                ref={contentRef}
                onClick={handleClick}
                className="prose-reading text-stone-800"
              >
                <DictationSentenceRenderer
                  sentences={speech.sentences}
                  dictationSentenceIndex={dictationSentenceIndex}
                  currentSentenceIndex={speech.currentSentenceIndex}
                  isSpeaking={speech.isSpeaking}
                  savedDictationInputs={isDictationStorageLoaded ? dictationInputs : {}}
                  realTimeInputs={realTimeInputs}
                  onRealTimeInputUpdate={handleRealTimeInputUpdate}
                  onDictationComplete={handleDictationComplete}
                />
              </div>
            ) : (
              // Normal mode: Use HTML rendering
              <div
                ref={contentRef}
                onClick={handleClick}
                dangerouslySetInnerHTML={{
                  __html: processedHtml,
                }}
                className="prose-reading text-stone-800"
              />
            )}

            {!speech.originalText.trim() && (
              <div className="text-center text-stone-500 py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-stone-700 mb-2">开始阅读之旅</h3>
                  <p className="text-stone-500 text-sm">
                    点击右上角设置按钮，输入或选择文本开始精读
                  </p>
                </div>
              </div>
            )}

            {/* Dictation mode instructions */}
            {isDictationMode && dictationSentenceIndex === null && speech.originalText.trim() && (
              <div className="mt-12 border-t border-stone-200 pt-8">
                <div className="text-center text-stone-600 py-8 bg-stone-50 rounded-lg">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-stone-800 mb-2">默写模式已启用</h3>
                  <p className="text-stone-600 text-sm mb-1">点击上方任意句子开始默写练习</p>
                  <p className="text-xs text-stone-500">句子仍可点击朗读，帮助您听清发音</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dictionary Popup */}
      <DictionaryPopup
        word={currentWord}
        data={dictionaryData}
        loading={dictionaryLoading}
        error={dictionaryError}
        isVisible={dictionaryVisible}
        onClose={closeDictionary}
        onSpeak={speech.speak}
      />
    </div>
  );
}

export default App;
