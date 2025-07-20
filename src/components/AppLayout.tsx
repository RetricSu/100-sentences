import React from 'react';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { TextRenderer } from './TextRenderer';
import { DictionaryPopup } from './DictionaryPopup';
import { useSpeech } from '../hooks/useSpeech';

interface AppLayoutProps {
  // Speech instance
  speech: ReturnType<typeof useSpeech>;

  // Settings props (simplified)
  showSettings: boolean;
  onTextUpdate: (text: string) => void;
  defaultText: string;
  displayText: string;

  // Text renderer props
  isDictationMode: boolean;
  processedHtml: string;
  dictationSentenceIndex: number | null;
  dictationInputs: Record<string, string>;
  realTimeInputs: Record<string, string>;
  onRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
  onDictationComplete: () => void;
  onClick: (event: React.MouseEvent) => void;

  // Dictionary popup props (simplified)
  dictionaryLoading: boolean;
  dictionaryError: string | null;
  onSpeak: (text: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  // Speech instance
  speech,

  // Settings props (simplified)
  showSettings,
  onTextUpdate,
  defaultText,
  displayText,

  // Text renderer props
  isDictationMode,
  processedHtml,
  dictationSentenceIndex,
  dictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
  onDictationComplete,
  onClick,

  // Dictionary popup props (simplified)
  dictionaryLoading,
  dictionaryError,
  onSpeak,
}) => {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <Header speech={speech} />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <TextRenderer
            processedHtml={processedHtml}
            speech={speech}
            isDictationMode={isDictationMode}
            dictationSentenceIndex={dictationSentenceIndex}
            dictationInputs={dictationInputs}
            realTimeInputs={realTimeInputs}
            onRealTimeInputUpdate={onRealTimeInputUpdate}
            onDictationComplete={onDictationComplete}
            onClick={onClick}
          />
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            onTextUpdate={onTextUpdate}
            defaultText={defaultText}
            displayText={displayText}
          />
        )}
      </div>

      {/* Dictionary Popup */}
      <DictionaryPopup
        loading={dictionaryLoading}
        error={dictionaryError}
        onSpeak={onSpeak}
      />
    </div>
  );
}; 
