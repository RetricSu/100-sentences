import React from "react";
import { useAppStateContext } from "../contexts/AppStateContext";
import { useSpeechContext } from "../contexts/SpeechContext";
import { useDictionaryContext } from "../contexts/DictionaryContext";
import { useDictationContext } from "../contexts/DictationContext";

export const Header: React.FC = () => {
  const appState = useAppStateContext();
  const speech = useSpeechContext();
  const dictionary = useDictionaryContext();
  const dictation = useDictationContext();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">百句斩</h1>
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

          <div className="flex items-center gap-4">
            {/* Left side - Navigation controls */}
            <div className="flex items-center gap-4">
              {/* Previous/Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    speech.jumpToSentence(speech.currentSentenceIndex - 1)
                  }
                  disabled={speech.currentSentenceIndex === 0}
                  className="p-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous sentence"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Play current sentence button */}
                <button
                  onClick={() => speech.speakCurrentSentence()}
                  disabled={!speech.originalText.trim()}
                  className="flex items-center gap-2 p-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Play current sentence"
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
                      d="M5 3v18l15-9-15-9z"
                    />
                  </svg>
                  朗读句子
                </button>

                <button
                  onClick={() =>
                    speech.jumpToSentence(speech.currentSentenceIndex + 1)
                  }
                  disabled={
                    speech.currentSentenceIndex === speech.sentences.length - 1
                  }
                  className="p-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next sentence"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Current sentence indicator */}
              <div className="text-sm text-stone-500">
                {speech.sentences.length > 0
                  ? `${speech.currentSentenceIndex + 1} / ${
                      speech.sentences.length
                    }`
                  : "No text"}
              </div>
            </div>

            {/* Center - Reading controls */}
            <div className="flex items-center gap-3">
              {/* Play/Stop button */}
              {speech.isSpeaking ? (
                <button
                  onClick={() => speech.stop()}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => speech.speakAll(speech.currentSentenceIndex)}
                  disabled={!speech.originalText.trim()}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      d="M5 3v18l15-9-15-9z"
                    />
                  </svg>
                  播放全文
                </button>
              )}
            </div>

            {/* Right side - Mode toggles and settings */}
            <div className="flex items-center gap-3">
              {/* Dictation mode toggle */}
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
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  appState.isDictationMode
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                默写模式
              </button>

              {/* Settings button */}
              <button
                onClick={appState.toggleSettings}
                className="p-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
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
      </div>
    </header>
  );
};
