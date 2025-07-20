import React from 'react';
import { Header } from './Header';
import { SettingsPanel } from './SettingsPanel';
import { DictionaryPopup } from './DictionaryPopup';
import { DictationRenderer } from './dictation/DictationRenderer';
import { RecitationRenderer } from './recitation/RecitationRenderer';
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Content - Full width when settings are closed */}
        <div className="w-full">
          {appState.isDictationMode ? (
            <DictationRenderer />
          ) : appState.isRecitationMode ? (
            <RecitationRenderer />
          ) : (
            <ReadingRenderer />
          )}
        </div>
      </div>

      {/* Floating Settings Panel */}
      {appState.showSettings && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={appState.toggleSettings}
          />
          
          {/* Settings Panel */}
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out">
            <SettingsPanel
              onTextUpdate={textManagement.handleTextUpdate}
              defaultText={textManagement.defaultText}
              displayText={speech.originalText}
              onClose={appState.toggleSettings}
            />
          </div>
        </div>
      )}

      {/* Dictionary Popup */}
      <DictionaryPopup />
    </div>
  );
}; 
