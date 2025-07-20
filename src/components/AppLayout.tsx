import React from 'react';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { TextRenderer } from './TextRenderer';
import { DictionaryPopup } from './DictionaryPopup';
import { useAppStateContext } from '../contexts/AppStateContext';
import { useSpeechContext } from '../contexts/SpeechContext';
import { useTextManagement } from '../hooks/useTextManagement';

interface AppLayoutProps {
  // Only keep props that can't be easily moved to context
  dictationInputs: Record<string, string>;
  realTimeInputs: Record<string, string>;
  onRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  dictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
}) => {
  const appState = useAppStateContext();
  const speech = useSpeechContext();
  
  // Get text management from hook
  const textManagement = useTextManagement({
    isDictationMode: appState.isDictationMode,
  });

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <TextRenderer
            processedHtml={textManagement.processedHtml}
            dictationInputs={dictationInputs}
            realTimeInputs={realTimeInputs}
            onRealTimeInputUpdate={onRealTimeInputUpdate}
          />
        </div>

        {/* Settings Panel */}
        {appState.showSettings && (
          <SettingsPanel
            onTextUpdate={textManagement.handleTextUpdate}
            defaultText={textManagement.defaultText}
            displayText={speech.originalText}
          />
        )}
      </div>

      {/* Dictionary Popup */}
      <DictionaryPopup />
    </div>
  );
}; 
