import React from "react";

interface HeaderProps {
  // Dictionary status
  dictionaryLoaded: boolean;
  dictionarySize: number;
  isDictionaryLoading: boolean;
  loadingProgress: number;

  // Sentence navigation
  sentences: string[];
  currentSentenceIndex: number;
  onSentenceNavigate: (index: number) => void;
  onSpeakCurrentSentence: () => void;

  // Reading controls
  isSpeaking: boolean;
  hasText: boolean;
  onToggleReading: () => void;

  // Settings
  onToggleSettings: () => void;

  // Dictation mode
  isDictationMode: boolean;
  onToggleDictationMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dictionaryLoaded,
  dictionarySize,
  isDictionaryLoading,
  loadingProgress,
  sentences,
  currentSentenceIndex,
  onSentenceNavigate,
  onSpeakCurrentSentence,
  isSpeaking,
  hasText,
  onToggleReading,
  onToggleSettings,
  isDictationMode,
  onToggleDictationMode,
}) => {
  const handlePreviousSentence = () => {
    if (currentSentenceIndex > 0) {
      onSentenceNavigate(currentSentenceIndex - 1);
    }
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      onSentenceNavigate(currentSentenceIndex + 1);
    }
  };

  const handleStopReading = () => {
    if (isSpeaking) {
      onToggleReading();
    }
  };

  const handleStartReading = () => {
    if (!isSpeaking) {
      onToggleReading();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">英语精读</h1>
          {dictionaryLoaded && (
            <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              📖 {dictionarySize.toLocaleString()} words
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Indicator */}
          <button
            onClick={isSpeaking ? handleStopReading : undefined}
            disabled={!isSpeaking}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
              isSpeaking
                ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                : "bg-gray-100 text-gray-600 cursor-default"
            }`}
            title={isSpeaking ? "Click to stop reading" : "Reading status"}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isSpeaking ? "bg-white animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span>{isSpeaking ? "暂停" : "待机"}</span>
          </button>

          {/* Read All Button */}
          <button
            onClick={handleStartReading}
            disabled={!hasText || isSpeaking}
            className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg"
            title="Read all text"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728"
              />
            </svg>
            <span>朗读全文</span>
          </button>

          {/* Sentence Navigation */}
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={handlePreviousSentence}
              disabled={currentSentenceIndex === 0 || isSpeaking}
              className="p-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg"
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
              onClick={onSpeakCurrentSentence}
              disabled={sentences.length === 0 || isSpeaking}
              className="px-3 py-2 bg-green-500 text-white font-medium hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
              title="Speak current sentence"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12 6.5z"
                />
              </svg>
              <span className="text-sm">朗读句子</span>
            </button>

            <button
              onClick={handleNextSentence}
              disabled={
                currentSentenceIndex >= sentences.length - 1 ||
                isSpeaking
              }
              className="p-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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

            <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 rounded-r-lg border-l border-gray-200">
              {sentences.length > 0
                ? `${currentSentenceIndex + 1}/${sentences.length}`
                : "0/0"}
            </div>
          </div>

          {/* Dictation Mode Toggle */}
          <button
            onClick={onToggleDictationMode}
            disabled={isSpeaking}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
              isSpeaking
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : isDictationMode
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-white hover:bg-gray-50 text-gray-600 shadow-sm border border-gray-200"
            }`}
            title={isSpeaking ? "Dictation mode disabled during reading" : isDictationMode ? "Exit dictation mode" : "Enter dictation mode"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>{isDictationMode ? "退出默写" : "默写模式"}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onToggleSettings}
            disabled={isSpeaking}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isSpeaking
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 text-gray-600 shadow-sm border border-gray-200"
            }`}
            title={isSpeaking ? "Settings disabled during reading" : "Settings"}
          >
            <svg
              className="w-5 h-5"
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
  );
};
