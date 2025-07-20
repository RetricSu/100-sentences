import React from 'react';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { DictionaryPopup } from './DictionaryPopup';
import { DictationRenderer } from './dictation/DictationRenderer';
import { ReadingRenderer } from './reading/ReadingRenderer';
import { useAppStateContext } from '../contexts/AppStateContext';
import { useSpeechContext } from '../contexts/SpeechContext';
import { useTextManagement } from '../hooks/useTextManagement';

export const AppLayout: React.FC = () => {
  const appState = useAppStateContext();
  const speech = useSpeechContext();
  
  // Get text management from hook
  const textManagement = useTextManagement();

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {appState.isDictationMode ? (
            <DictationRenderer />
          ) : (
            <ReadingRenderer />
          )}
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
