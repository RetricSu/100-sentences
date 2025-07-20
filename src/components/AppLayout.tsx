import React from 'react';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { TextRenderer } from './TextRenderer';
import { DictionaryPopup } from './DictionaryPopup';

interface AppLayoutProps {
  // Settings props (simplified)
  showSettings: boolean;
  onTextUpdate: (text: string) => void;
  defaultText: string;
  displayText: string;

  // Text renderer props
  processedHtml: string;
  dictationInputs: Record<string, string>;
  realTimeInputs: Record<string, string>;
  onRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
  onDictationComplete: () => void;
  onClick: (event: React.MouseEvent) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  // Settings props (simplified)
  showSettings,
  onTextUpdate,
  defaultText,
  displayText,

  // Text renderer props
  processedHtml,
  dictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
  onDictationComplete,
  onClick,
}) => {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <TextRenderer
            processedHtml={processedHtml}
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
      <DictionaryPopup />
    </div>
  );
}; 
