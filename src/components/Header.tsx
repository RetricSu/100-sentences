import React from 'react';

interface HeaderProps {
  // Dictionary status
  dictionaryLoaded: boolean;
  dictionarySize: number;
  isDictionaryLoading: boolean;
  loadingProgress: number;
  
  // Sentence navigation
  localSentences: string[];
  localCurrentSentenceIndex: number;
  onSentenceNavigate: (index: number) => void;
  onSpeakCurrentSentence: () => void;
  
  // Reading controls
  isSpeaking: boolean;
  displayText: string;
  onToggleReading: () => void;
  
  // Settings
  onToggleSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dictionaryLoaded,
  dictionarySize,
  isDictionaryLoading,
  loadingProgress,
  localSentences,
  localCurrentSentenceIndex,
  onSentenceNavigate,
  onSpeakCurrentSentence,
  isSpeaking,
  displayText,
  onToggleReading,
  onToggleSettings,
}) => {
  const handlePreviousSentence = () => {
    if (localCurrentSentenceIndex > 0) {
      onSentenceNavigate(localCurrentSentenceIndex - 1);
    }
  };

  const handleNextSentence = () => {
    if (localCurrentSentenceIndex < localSentences.length - 1) {
      onSentenceNavigate(localCurrentSentenceIndex + 1);
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
          {/* Sentence Navigation Controls */}
          {localSentences.length > 0 && (
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
              <button
                onClick={handlePreviousSentence}
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
                onClick={onSpeakCurrentSentence}
                disabled={localSentences.length === 0}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Speak current sentence"
              >
                ▶
              </button>

              <button
                onClick={handleNextSentence}
                disabled={localCurrentSentenceIndex >= localSentences.length - 1}
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
            onClick={onToggleReading}
            disabled={!displayText.trim()}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isSpeaking
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            }`}
          >
            <span className="hidden sm:inline">
              {isSpeaking ? "停止" : "朗读全文"}
            </span>
          </button>

          {/* Settings Toggle */}
          <button
            onClick={onToggleSettings}
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
  );
}; 
