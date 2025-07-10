import React, { useState, useCallback, useEffect } from "react";
import { useSpeech } from "./hooks/useSpeech";
import { useDictionary } from "./hooks/useDictionary";
import {
  useLocalStorage,
  SavedText as SavedTextType,
} from "./hooks/useLocalStorage";
import { DictionaryPopup } from "./components/DictionaryPopup";
import { DictionaryEntry } from "./types/index";

// Type for saved texts
const defaultText = `The Dragon Boat Festival happens on the 5th day of the 5th lunar month, usually in June. Chinese people call it 'Duan‑wu Jie'. The holiday remembers a kind poet named Qu Yuan. When his country was lost, he jumped into a river in sadness.

People raced long wooden boats shaped like dragons to try to save him. Today the races are the most exciting part of the festival. Each boat has a drummer who beats a rhythm so the paddlers can row together.

Families also make and eat zongzi, sticky rice wrapped in bamboo leaves. Some put meat, peanuts, or red beans inside. Eating zongzi is said to keep bad luck away.`;

function App() {
  const [inputText, setInputText] = useState("");
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

  // Saved texts UI state
  const [showSavedTexts, setShowSavedTexts] = useState(false);
  const [saveTextTitle, setSaveTextTitle] = useState("");

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

  // Convert text when button is clicked
  const handleConvert = useCallback(() => {
    const textToProcess = inputText.trim() || defaultText;
    setDisplayText(textToProcess);

    // Process text for display
    const processedText = processText(textToProcess);
    setProcessedHtml(processedText);

    // Update local sentences
    const newSentences = processSentences(textToProcess);
    setLocalSentences(newSentences);
    setLocalCurrentSentenceIndex(0);

    // Update sentences in speech hook
    updateSentences(textToProcess);
  }, [inputText]);

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
    [speak, lookupWord, jumpToSentence]
  );

  // Close dictionary popup
  const closeDictionary = useCallback(() => {
    setDictionaryVisible(false);
    setCurrentWord("");
    setDictionaryData(null);
  }, []);

  // Save current text
  const handleSaveText = useCallback(() => {
    if (!displayText.trim()) return;
    const title = saveTextTitle.trim() || undefined;
    saveText(displayText, title);
    setSaveTextTitle("");
    alert("Text saved successfully!");
  }, [displayText, saveTextTitle, saveText]);

  // Load saved text
  const handleLoadText = useCallback(
    (savedText: SavedTextType) => {
      setDisplayText(savedText.content);
      setInputText(savedText.content);

      // Process text for display
      const processedText = processText(savedText.content);
      setProcessedHtml(processedText);

      // Update local sentences
      const newSentences = processSentences(savedText.content);
      setLocalSentences(newSentences);
      setLocalCurrentSentenceIndex(0);

      // Update sentences in speech hook
      updateSentences(savedText.content);
    },
    [processText, processSentences, updateSentences]
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
  }, [displayText]);

  // Update processed HTML when current sentence changes
  useEffect(() => {
    if (displayText.trim()) {
      const processedText = processText(displayText);
      setProcessedHtml(processedText);
    }
  }, [localCurrentSentenceIndex, displayText]);

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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Click-to-Read</h1>
            {dictionaryLoaded && (
              <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                📖 {dictionarySize.toLocaleString()} words
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Sentence Navigation Controls */}
            {localSentences.length > 0 && (
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                <button
                  onClick={() => {
                    if (localCurrentSentenceIndex > 0) {
                      const prevIndex = localCurrentSentenceIndex - 1;
                      setLocalCurrentSentenceIndex(prevIndex);
                      jumpToSentence(prevIndex);
                    }
                  }}
                  disabled={localCurrentSentenceIndex === 0}
                  className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous sentence"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    if (
                      localSentences.length > 0 &&
                      localCurrentSentenceIndex < localSentences.length
                    ) {
                      speak(localSentences[localCurrentSentenceIndex]);
                    }
                  }}
                  disabled={localSentences.length === 0}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Speak current sentence"
                >
                  ▶
                </button>

                <button
                  onClick={() => {
                    if (localCurrentSentenceIndex < localSentences.length - 1) {
                      const nextIndex = localCurrentSentenceIndex + 1;
                      setLocalCurrentSentenceIndex(nextIndex);
                      jumpToSentence(nextIndex);
                    }
                  }}
                  disabled={
                    localCurrentSentenceIndex >= localSentences.length - 1
                  }
                  className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next sentence"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <span className="text-xs text-gray-500 ml-2">
                  {localCurrentSentenceIndex + 1}/{localSentences.length}
                </span>
              </div>
            )}

            {/* Reading Control */}
            <button
              onClick={() =>
                isSpeaking
                  ? stop()
                  : speakAll(displayText, localCurrentSentenceIndex)
              }
              disabled={!displayText.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isSpeaking
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              }`}
            >
              <span className="hidden sm:inline">
                {isSpeaking ? "Stop" : "Read All"}
              </span>
            </button>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Settings"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading Bar */}
        {isDictionaryLoading && (
          <div className="bg-orange-50 px-4 py-2 border-t border-orange-200">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between text-sm text-orange-600 mb-2">
                <span>Loading dictionary... ({loadingProgress}%)</span>
                <span className="text-xs">
                  {loadingProgress < 50 ? "Downloading..." : "Processing..."}
                </span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
        {/* Settings Sidebar */}
        <div
          className={`transition-all duration-300 ${
            showSettings ? "w-80" : "w-0"
          } overflow-hidden`}
        >
          <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-800 mb-4">Settings</h3>

            {/* Input Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter English text or leave empty to use default..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleConvert}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                >
                  Update Text
                </button>
                <button
                  onClick={handleSaveText}
                  disabled={!displayText.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Save current text"
                >
                  💾
                </button>
              </div>

              {/* Save Text Title Input */}
              <div className="mt-2">
                <input
                  type="text"
                  value={saveTextTitle}
                  onChange={(e) => setSaveTextTitle(e.target.value)}
                  placeholder="Optional: Enter title for saving..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Saved Texts Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Saved Texts ({storedTexts.length})
                </label>
                <button
                  onClick={() => setShowSavedTexts(!showSavedTexts)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  {showSavedTexts ? "Hide" : "Show"}
                </button>
              </div>

              {showSavedTexts && (
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                  {savedTextsLoading ? (
                    <div className="text-center text-gray-500 py-4">
                      Loading saved texts...
                    </div>
                  ) : storedTexts.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No saved texts yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {storedTexts.map((savedText) => (
                        <div
                          key={savedText.id}
                          className="bg-white p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm">
                                {savedText.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {savedText.createdAt.toLocaleDateString()} at{" "}
                                {savedText.createdAt.toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {savedText.content.substring(0, 100)}...
                              </p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => handleLoadText(savedText)}
                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                title="Load this text"
                              >
                                📖
                              </button>
                              <button
                                onClick={() => handleDeleteText(savedText.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Delete this text"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {storedTexts.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <button
                            onClick={handleClearAllTexts}
                            className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Clear All Saved Texts
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice
              </label>
              <select
                value={voices.findIndex((v) => v.voice === selectedVoice)}
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  if (index >= 0 && voices[index]) {
                    setSelectedVoice(voices[index].voice);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={-1}>Select voice...</option>
                {voices.map((voiceOption, index) => (
                  <option key={index} value={index}>
                    {voiceOption.voice.name} ({voiceOption.voice.lang})
                    {voiceOption.voice.localService ? " 📍" : " ☁️"}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reading Speed: {rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5x</span>
                <span>2x</span>
              </div>
            </div>

            {/* Sentence Navigator */}
            {localSentences.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sentence Navigator ({localSentences.length} sentences)
                </label>
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-2 space-y-1">
                  {localSentences.map((sentence, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setLocalCurrentSentenceIndex(index);
                        jumpToSentence(index);
                      }}
                      className={`w-full text-left text-xs p-2 rounded transition-colors ${
                        index === localCurrentSentenceIndex
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{index + 1}:</span>{" "}
                      {sentence.substring(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
