import React from 'react';
import { Header } from '../Header';
import { SettingsPanel } from '../SettingsPanel';
import { DictionaryPopup } from '../DictionaryPopup';
import { NotificationContainer } from '../notify/NotificationContainer';
import { useAppStateContext } from '../../contexts/AppStateContext';
import { useTextManagement } from '../../hooks/useTextManagement';
import { useSpeechContext } from '../../contexts/SpeechContext';

interface BaseLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true 
}) => {
  const appState = useAppStateContext();
  const textManagement = useTextManagement();
  const speech = useSpeechContext();

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
      {/* Header */}
      {showHeader && <Header />}

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-white border-t border-stone-200 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center text-stone-500 text-sm">
              <p>百句斩 - 以句子为基本单位，练习阅读、听写和发音</p>
            </div>
          </div>
        </footer>
      )}

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
      
      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
}; 
