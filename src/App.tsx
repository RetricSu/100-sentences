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

  // Remove the entire manual React root management useEffect
  // This will be replaced with proper declarative rendering

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
    <div className="min-h-screen bg-gray-50 font-sans">
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

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
        {/* Settings Sidebar */}
        <div
          className={`transition-all duration-300 ${
            showSettings ? "w-80" : "w-0"
          } overflow-hidden`}
        >
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

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {isDictationMode && speech.originalText.trim() ? (
              // Dictation mode: Use React components for declarative rendering
              <div
                ref={contentRef}
                onClick={handleClick}
                className="prose prose-lg max-w-none leading-relaxed text-gray-900"
                style={{
                  fontSize: "18px",
                  lineHeight: "1.8",
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                }}
              >
                <DictationSentenceRenderer
                  sentences={speech.sentences}
                  dictationSentenceIndex={dictationSentenceIndex}
                  currentSentenceIndex={speech.currentSentenceIndex}
                  isSpeaking={speech.isSpeaking}
                  savedDictationInputs={isDictationStorageLoaded ? getAllDictationInputs() : {}}
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
                className="prose prose-lg max-w-none leading-relaxed text-gray-900"
                style={{
                  fontSize: "18px",
                  lineHeight: "1.8",
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                }}
              />
            )}

            {!speech.originalText.trim() && (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">Click "Update Text" to start reading</p>
                <p className="text-sm mt-2">
                  Or use the default text by clicking the button
                </p>
              </div>
            )}

            {/* Dictation mode instructions */}
            {isDictationMode && dictationSentenceIndex === null && speech.originalText.trim() && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="text-center text-gray-600 py-8">
                  <div className="text-lg font-medium mb-2">默写模式已启用</div>
                  <p className="text-sm">点击上方任意句子开始默写练习</p>
                  <p className="text-xs mt-1 text-gray-500">句子仍可点击朗读，帮助您听清发音</p>
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
