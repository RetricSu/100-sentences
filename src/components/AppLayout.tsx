import React from 'react';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { DictionaryPopup } from './DictionaryPopup';
import { TextRenderer } from './TextRenderer';

interface AppLayoutProps {
  // Header props
  dictionaryLoaded: boolean;
  dictionarySize: number;
  isDictionaryLoading: boolean;
  loadingProgress: number;
  sentences: string[];
  currentSentenceIndex: number;
  onSentenceNavigate: (index: number) => void;
  onSpeakCurrentSentence: () => void;
  isSpeaking: boolean;
  hasText: boolean;
  onToggleReading: () => void;
  onToggleSettings: () => void;
  isDictationMode: boolean;
  onToggleDictationMode: () => void;
  hotkeyPressed: boolean;

  // Settings props (simplified)
  showSettings: boolean;
  onTextUpdate: (text: string) => void;
  defaultText: string;
  displayText: string;

  // Text renderer props
  processedHtml: string;
  speech: any;
  dictationSentenceIndex: number | null;
  dictationInputs: Record<string, string>;
  realTimeInputs: Record<string, string>;
  onRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
  onDictationComplete: () => void;
  onClick: (event: React.MouseEvent) => void;

  // Dictionary popup props
  currentWord: string;
  dictionaryData: any;
  dictionaryLoading: boolean;
  dictionaryError: string | null;
  dictionaryVisible: boolean;
  onCloseDictionary: () => void;
  onSpeak: (text: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  // Header props
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
  hotkeyPressed,

  // Settings props (simplified)
  showSettings,
  onTextUpdate,
  defaultText,
  displayText,

  // Text renderer props
  processedHtml,
  speech,
  dictationSentenceIndex,
  dictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
  onDictationComplete,
  onClick,

  // Dictionary popup props
  currentWord,
  dictionaryData,
  dictionaryLoading,
  dictionaryError,
  dictionaryVisible,
  onCloseDictionary,
  onSpeak,
}) => {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <Header
        dictionaryLoaded={dictionaryLoaded}
        dictionarySize={dictionarySize}
        isDictionaryLoading={isDictionaryLoading}
        loadingProgress={loadingProgress}
        sentences={sentences}
        currentSentenceIndex={currentSentenceIndex}
        onSentenceNavigate={onSentenceNavigate}
        onSpeakCurrentSentence={onSpeakCurrentSentence}
        isSpeaking={isSpeaking}
        hasText={hasText}
        onToggleReading={onToggleReading}
        onToggleSettings={onToggleSettings}
        isDictationMode={isDictationMode}
        onToggleDictationMode={onToggleDictationMode}
        hotkeyPressed={hotkeyPressed}
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
              onTextUpdate={onTextUpdate}
              defaultText={defaultText}
              displayText={displayText}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="card p-8 lg:p-12">
            <TextRenderer
              isDictationMode={isDictationMode}
              processedHtml={processedHtml}
              speech={speech}
              dictationSentenceIndex={dictationSentenceIndex}
              dictationInputs={dictationInputs}
              realTimeInputs={realTimeInputs}
              onRealTimeInputUpdate={onRealTimeInputUpdate}
              onDictationComplete={onDictationComplete}
              onClick={onClick}
            />

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
        onClose={onCloseDictionary}
        onSpeak={onSpeak}
      />
    </div>
  );
}; 
