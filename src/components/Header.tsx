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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">顽童英语</h1>
          {dictionaryLoaded && (
            <div className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
              {dictionarySize.toLocaleString()} 本地词典
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          <button
            onClick={isSpeaking ? handleStopReading : undefined}
            disabled={!isSpeaking}
            className={`btn-secondary px-4 py-2 ${
              isSpeaking ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" : ""
            }`}
            title={isSpeaking ? "点击停止朗读" : "阅读状态"}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isSpeaking ? "bg-rose-500 animate-pulse" : "bg-stone-400"
              }`}
            ></div>
            <span className="text-sm font-medium">{isSpeaking ? "暂停" : "待机"}</span>
          </button>

          {/* Read All Button */}
          <button
            onClick={handleStartReading}
            disabled={!hasText || isSpeaking}
            className="btn-secondary"
            title="朗读全文"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
            </svg>
            朗读全文
          </button>

          {/* Sentence Navigation */}
          <div className="flex items-center bg-white rounded-lg shadow-soft border border-stone-200">
            <button
              onClick={handlePreviousSentence}
              disabled={currentSentenceIndex === 0 || isSpeaking}
              className="p-2.5 hover:bg-stone-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg"
              title="上一句"
            >
              <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={onSpeakCurrentSentence}
              disabled={sentences.length === 0 || isSpeaking}
              className="px-3 py-2 bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors duration-200 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center space-x-1"
              title="朗读当前句子"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12 6.5z" />
              </svg>
              <span className="text-sm">朗读句子</span>
            </button>

            <button
              onClick={handleNextSentence}
              disabled={currentSentenceIndex >= sentences.length - 1 || isSpeaking}
              className="p-2.5 hover:bg-stone-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title="下一句"
            >
              <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="px-3 py-2 bg-stone-50 text-xs font-medium text-stone-500 rounded-r-lg border-l border-stone-200"
            >
              {sentences.length > 0 ? `${currentSentenceIndex + 1}/${sentences.length}` : "0/0"}
            </div>
          </div>

          {/* Dictation Mode Toggle */}
          <button
            onClick={onToggleDictationMode}
            disabled={isSpeaking}
            className={`btn-secondary ${
              isDictationMode ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" : ""
            } ${isSpeaking ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isSpeaking ? "朗读时无法切换模式" : isDictationMode ? "退出默写模式" : "进入默写模式"}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isDictationMode ? "退出默写" : "默写模式"}
          </button>

          {/* Settings */}
          <button
            onClick={onToggleSettings}
            disabled={isSpeaking}
            className={`btn-secondary p-2.5 ${isSpeaking ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isSpeaking ? "朗读时无法打开设置" : "设置"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading Bar */}
      {isDictionaryLoading && (
        <div className="bg-amber-50 px-6 py-2 border-t border-amber-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-sm text-amber-700 mb-2">
              <span>正在加载词典... ({loadingProgress}%)</span>
              <span className="text-xs">
                {loadingProgress < 50 ? "正在下载..." : "正在处理..."}
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
