import React, { useState, useCallback, useEffect } from "react";
import { useSpeech } from "./hooks/useSpeech";
import { useDictionary } from "./hooks/useDictionary";
import {
  useLocalStorage,
  SavedText as SavedTextType,
} from "./hooks/useLocalStorage";
import { DictionaryPopup } from "./components/DictionaryPopup";
import { Header } from "./components/Header";
import { SettingsPanel } from "./components/SettingsPanel";
import { DictionaryEntry } from "./types/index";
import { defaultText } from "./data/const";

function App() {
  const [displayText, setDisplayText] = useState(defaultText);
  const [processedHtml, setProcessedHtml] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Dictionary popup state
  const [dictionaryVisible, setDictionaryVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry | null>(
    null
  );

  // Local sentence state
  const [localSentences, setLocalSentences] = useState<string[]>([]);
  const [localCurrentSentenceIndex, setLocalCurrentSentenceIndex] = useState(0);

  const {
    voices,
    selectedVoice,
    rate,
    isSupported,
    isSpeaking,
    setSelectedVoice,
    setRate,
    speak,
    speakAll,
    stop,
    // Enhanced sentence-based functionality
    currentSentenceIndex,
    updateSentences,
    jumpToSentence,
  } = useSpeech();

  const {
    lookupWord,
    loading: dictionaryLoading,
    error: dictionaryError,
    dictionaryLoaded,
    dictionarySize,
    loadingProgress,
    isLoading: isDictionaryLoading,
  } = useDictionary();

  const {
    savedTexts: storedTexts,
    loading: savedTextsLoading,
    saveText,
    deleteText,
    clearAllTexts,
  } = useLocalStorage();

  // Process text into clickable words with sentence highlighting and paragraph spacing
  const processText = useCallback(
    (text: string) => {
      if (!text.trim()) return "";

      // First split into paragraphs
      const paragraphs = text
        .split(/\n\s*\n/)
        .filter((p) => p.trim().length > 0);
      let globalSentenceIndex = 0;

      return paragraphs
        .map((paragraph, paragraphIndex) => {
          // Split each paragraph into sentences
          const paragraphSentences = paragraph
            .split(/(?<=[.!?])\s+/)
            .filter((s) => s.trim().length > 0);

          const processedSentences = paragraphSentences
            .map((sentence) => {
              const words = sentence.trim().split(/\s+/);
              const processedWords = words
                .map(
                  (word) =>
                    `<span class="word cursor-pointer px-1 py-1 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 hover:shadow-sm">${word}</span>`
                )
                .join(" ");

              // Highlight current sentence
              const isCurrentSentence =
                globalSentenceIndex === localCurrentSentenceIndex;
              const sentenceClass = isCurrentSentence
                ? "current-sentence bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-2 my-2 rounded-r-lg shadow-sm"
                : "sentence py-1 my-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors";

              const sentenceDiv = `<div class="${sentenceClass}" data-sentence-index="${globalSentenceIndex}">${processedWords}</div>`;
              globalSentenceIndex++;
              return sentenceDiv;
            })
            .join("");

          // Wrap each paragraph with spacing
          const paragraphClass =
            paragraphIndex === 0
              ? "paragraph-block mb-8 first:mb-8"
              : "paragraph-block mb-8 pt-4 border-t border-gray-100";

          return `<div class="${paragraphClass}">${processedSentences}</div>`;
        })
        .join("");
    },
    [localCurrentSentenceIndex]
  );

  // Process sentences separately
  const processSentences = useCallback((text: string) => {
    if (!text.trim()) return [];

    const rawSentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    return rawSentences
      .map((sentence) => {
        const trimmed = sentence.trim();
        if (trimmed && !trimmed.match(/[.!?]$/)) {
          return trimmed + ".";
        }
        return trimmed;
      })
      .filter((s) => s.length > 0);
  }, []);

  // Handle text updates from SettingsPanel
  const handleTextUpdate = useCallback((text: string) => {
    setDisplayText(text);

    // Process text for display
    const processedText = processText(text);
    setProcessedHtml(processedText);

    // Update local sentences
    const newSentences = processSentences(text);
    setLocalSentences(newSentences);
    setLocalCurrentSentenceIndex(0);

    // Update sentences in speech hook
    updateSentences(text);
  }, [processText, processSentences, updateSentences]);

  // Handle word clicks and sentence clicks
  const handleWordClick = useCallback(
    async (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      // Handle word clicks first (priority over sentence clicks)
      if (target.classList.contains("word")) {
        const word = target.textContent?.replace(/[^A-Za-z']/g, "") || "";
        if (!word) return;

        speak(word);

        // Show popup immediately
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
        return; // Important: return early to prevent sentence click
      }

      // Handle sentence clicks (only if not clicking on a word)
      // Check for both regular sentences and currently selected sentences
      const sentenceDiv = target.closest(".sentence, .current-sentence");
      if (sentenceDiv && (sentenceDiv.classList.contains("sentence") || sentenceDiv.classList.contains("current-sentence"))) {
        const sentenceIndex = parseInt(
          sentenceDiv.getAttribute("data-sentence-index") || "0"
        );
        if (sentenceIndex >= 0 && sentenceIndex < localSentences.length) {
          setLocalCurrentSentenceIndex(sentenceIndex);
          jumpToSentence(sentenceIndex);
          speak(localSentences[sentenceIndex]);
        }
      }
    },
    [speak, lookupWord, jumpToSentence, localSentences]
  );

  // Close dictionary popup
  const closeDictionary = useCallback(() => {
    setDictionaryVisible(false);
    setCurrentWord("");
    setDictionaryData(null);
  }, []);

  // Handle saving text from SettingsPanel
  const handleSaveText = useCallback((text: string, title?: string) => {
    saveText(text, title);
  }, [saveText]);

  // Load saved text
  const handleLoadText = useCallback(
    (savedText: SavedTextType) => {
      // Update display text and process it
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

  // Header callback functions
  const handleSentenceNavigate = useCallback((index: number) => {
    setLocalCurrentSentenceIndex(index);
    jumpToSentence(index);
  }, [jumpToSentence]);

  const handleSpeakCurrentSentence = useCallback(() => {
    if (localSentences.length > 0 && localCurrentSentenceIndex < localSentences.length) {
      speak(localSentences[localCurrentSentenceIndex]);
    }
  }, [localSentences, localCurrentSentenceIndex, speak]);

  const handleToggleReading = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      speakAll(displayText, localCurrentSentenceIndex);
    }
  }, [isSpeaking, stop, speakAll, displayText, localCurrentSentenceIndex]);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings]);

  // Auto-load latest saved text on app initialization
  useEffect(() => {
    if (!savedTextsLoading && storedTexts.length > 0) {
      // Load the most recent saved text (first in the array)
      const latestText = storedTexts[0];
      console.log('Auto-loading latest saved text:', latestText.title);
      
      handleTextUpdate(latestText.content);
    }
  }, [savedTextsLoading, storedTexts.length, handleTextUpdate]);

  // Initialize processed text and sentences
  useEffect(() => {
    if (displayText.trim()) {
      const processedText = processText(displayText);
      setProcessedHtml(processedText);

      // Update local sentences
      const newSentences = processSentences(displayText);
      setLocalSentences(newSentences);
      setLocalCurrentSentenceIndex(0);

      // Update sentences in speech hook
      updateSentences(displayText);
    }
  }, [displayText, processText, processSentences, updateSentences]);

  // Update processed HTML when current sentence changes
  useEffect(() => {
    if (displayText.trim()) {
      const processedText = processText(displayText);
      setProcessedHtml(processedText);
    }
  }, [localCurrentSentenceIndex, displayText, processText]);

  // Sync local sentence index with hook sentence index
  useEffect(() => {
    if (currentSentenceIndex !== localCurrentSentenceIndex) {
      setLocalCurrentSentenceIndex(currentSentenceIndex);
    }
  }, [currentSentenceIndex, localCurrentSentenceIndex]);

  if (!isSupported) {
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
        localSentences={localSentences}
        localCurrentSentenceIndex={localCurrentSentenceIndex}
        onSentenceNavigate={handleSentenceNavigate}
        onSpeakCurrentSentence={handleSpeakCurrentSentence}
        isSpeaking={isSpeaking}
        displayText={displayText}
        onToggleReading={handleToggleReading}
        onToggleSettings={handleToggleSettings}
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
            displayText={displayText}
            savedTexts={storedTexts}
            savedTextsLoading={savedTextsLoading}
            onLoadText={handleLoadText}
            onDeleteText={handleDeleteText}
            onClearAllTexts={handleClearAllTexts}
            onSaveText={handleSaveText}
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            rate={rate}
            onRateChange={setRate}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div
              onClick={handleWordClick}
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

            {!processedHtml && (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">Click "Update Text" to start reading</p>
                <p className="text-sm mt-2">
                  Or use the default text by clicking the button
                </p>
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
        onSpeak={speak}
      />
    </div>
  );
}

export default App;
