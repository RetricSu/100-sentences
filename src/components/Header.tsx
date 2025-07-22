import React from "react";
import { useAppStateContext } from "../contexts/AppStateContext";
import { useSpeechContext } from "../contexts/SpeechContext";
import { useDictionaryContext } from "../contexts/DictionaryContext";
import { useDictationContext } from "../contexts/DictationContext";
import { useRecitationContext } from "../contexts/RecitationContext";

export const Header: React.FC = () => {
  const appState = useAppStateContext();
  const speech = useSpeechContext();
  const dictionary = useDictionaryContext();
  const dictation = useDictationContext();
  const recitation = useRecitationContext();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              <a href="/" rel="noopener noreferrer">
                百句斩
              </a>
            </h1>
            {/* Dictionary status indicator */}
            <div className="flex items-center gap-2 text-sm">
              {dictionary.isLoading ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span>加载词典... {dictionary.loadingProgress}%</span>
                </div>
              ) : dictionary.dictionaryLoaded ? (
                <div className="flex items-center gap-2 text-green-600">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    本地词典 ({dictionary.dictionarySize.toLocaleString()} 词汇)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>加载词典错误</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Standby button */}
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              待机
            </button>

            {/* Read full text button */}
            <button
              onClick={() => speech.speakAll(speech.currentSentenceIndex)}
              disabled={!speech.originalText.trim() || speech.isSpeaking}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              朗读全文
            </button>

            {/* Navigation controls group */}
            <div className="flex items-center rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => {
                  const newIndex = speech.currentSentenceIndex - 1;
                  if (newIndex >= 0) {
                    speech.jumpToSentence(newIndex);
                    speech.speakSentenceByIndex(newIndex);
                  }
                }}
                disabled={
                  speech.currentSentenceIndex === 0 || speech.isSpeaking
                }
                className="px-3 py-2 bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous sentence"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Play current sentence button */}
              <button
                onClick={() => speech.speakCurrentSentence()}
                disabled={!speech.originalText.trim() || speech.isSpeaking}
                className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Play current sentence"
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
                    d="M5 3v18l15-9-15-9z"
                  />
                </svg>
                朗读句子
                <span className="text-xs text-white">空格</span>
              </button>

              <button
                onClick={() => {
                  const newIndex = speech.currentSentenceIndex + 1;
                  if (newIndex < speech.sentences.length) {
                    speech.jumpToSentence(newIndex);
                    speech.speakSentenceByIndex(newIndex);
                  }
                }}
                disabled={
                  speech.currentSentenceIndex === speech.sentences.length - 1 ||
                  speech.isSpeaking
                }
                className="px-3 py-2 bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next sentence"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Progress indicator */}
              <div className="px-3 py-2 bg-gray-100 text-gray-500 text-sm border-l border-gray-200">
                {speech.sentences.length > 0
                  ? `${speech.currentSentenceIndex + 1}/${
                      speech.sentences.length
                    }`
                  : "No text"}
              </div>
            </div>

            {/* Mode buttons - only show when not in wrong word book */}
            {
              <>
                {/* Dictation mode button */}
                <button
                  onClick={() => {
                    if (appState.isDictationMode) {
                      appState.toggleDictationMode();
                      dictation.deactivate();
                    } else {
                      appState.toggleDictationMode();
                      dictation.activate();
                    }
                  }}
                  disabled={speech.isSpeaking}
                  className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm ${
                    appState.isDictationMode
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="切换默写模式"
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
                  默写模式
                </button>

                {/* Recitation mode button */}
                <button
                  onClick={() => {
                    if (appState.isRecitationMode) {
                      appState.toggleRecitationMode();
                      recitation.deactivate();
                    } else {
                      appState.toggleRecitationMode();
                      recitation.activate();
                    }
                  }}
                  disabled={speech.isSpeaking}
                  className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm ${
                    appState.isRecitationMode
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="切换朗读模式"
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
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  跟读模式
                </button>
              </>
            }

            {/* Settings button */}
            <button
              onClick={appState.toggleSettings}
              className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
              title="Settings"
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
      </div>
    </header>
  );
};
