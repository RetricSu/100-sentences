import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useAppStateContext } from './AppStateContext';
import { useSpeechContext } from './SpeechContext';
import { useDictionaryContext } from './DictionaryContext';
import { useDictationContext } from './DictationContext';
import { extractCleanWord } from '../utils/textProcessing';

interface EventHandlersContextType {
  handleWordClick: (event: React.MouseEvent) => Promise<any>;
  handleSentenceClick: (event: React.MouseEvent) => void;
  handleClick: (event: React.MouseEvent) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handleDictationComplete: () => void;
  handleRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
}

const EventHandlersContext = createContext<EventHandlersContextType | null>(null);

export const useEventHandlersContext = () => {
  const context = useContext(EventHandlersContext);
  if (!context) {
    throw new Error('useEventHandlersContext must be used within EventHandlersProvider');
  }
  return context;
};

interface EventHandlersProviderProps {
  children: React.ReactNode;
}

export const EventHandlersProvider: React.FC<EventHandlersProviderProps> = ({ children }) => {
  const appState = useAppStateContext();
  const speech = useSpeechContext();
  const { lookupWord } = useDictionaryContext();
  const dictation = useDictationContext();

  // Handle word click with dictionary lookup
  const handleWordClick = useCallback(
    async (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("word")) {
        const word = extractCleanWord(target.textContent || "");
        if (!word) return;

        // Speak the word
        speech.speak(word);

        // Show dictionary popup
        appState.showDictionary(word);

        // Lookup word
        try {
          const result = await lookupWord(word);
          appState.setDictionaryDataValue(result);
          return result;
        } catch (error) {
          console.error("Error looking up word:", error);
        }
      }
    },
    [speech, appState, lookupWord]
  );

  // Handle sentence click
  const handleSentenceClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      // Only handle sentence clicks if not clicking on a word
      if (target.classList.contains("word")) return;

      const sentenceDiv = target.closest(".sentence, .current-sentence");
      if (sentenceDiv) {
        const sentenceIndex = parseInt(
          sentenceDiv.getAttribute("data-sentence-index") || "0"
        );
        
        if (sentenceIndex >= 0 && sentenceIndex < speech.sentences.length) {
          // Stop current speech if speaking
          if (speech.isSpeaking) {
            speech.stop();
          }
          
          if (appState.isDictationMode) {
            // Check if clicking on the currently active dictation sentence
            if (dictation.currentSentenceIndex === sentenceIndex) {
              // Just speak the sentence without changing dictation state
              // This preserves focus on the input field
              setTimeout(() => {
                speech.speak(speech.sentences[sentenceIndex], sentenceIndex);
              }, 100);
            } else {
              // Set this sentence for dictation (different sentence)
              dictation.setCurrentSentence(sentenceIndex);
              speech.jumpToSentence(sentenceIndex);
              // Still speak the sentence for audio reference
              setTimeout(() => {
                speech.speak(speech.sentences[sentenceIndex], sentenceIndex);
              }, 100);
            }
          } else {
            // Normal mode - navigate to sentence and speak it
            speech.jumpToSentence(sentenceIndex);
            // Small delay to ensure stop takes effect
            setTimeout(() => {
              speech.speak(speech.sentences[sentenceIndex], sentenceIndex);
            }, 100);
          }
        }
      }
    },
    [speech, appState]
  );

  // Combined click handler
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      handleWordClick(event);
      handleSentenceClick(event);
    },
    [handleWordClick, handleSentenceClick]
  );

  // Global keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only trigger on spacebar and when not typing in an input field
      const target = event.target as HTMLElement;
      
      // More comprehensive input field detection
      const isInputField = 
        (target?.tagName === 'INPUT' && !target?.classList.contains('opacity-0')) || 
        target?.tagName === 'TEXTAREA' || 
        target?.contentEditable === 'true';
      
      // Check for both Space code and space key
      if ((event.code === 'Space' || event.key === ' ') && !isInputField) {
        event.preventDefault();
        event.stopPropagation();
        
        console.debug('Space hotkey triggered', {
          target: target?.tagName,
          isInputField,
          hasOpacity0: target?.classList.contains('opacity-0'),
          isSpeaking: speech.isSpeaking,
          sentencesLength: speech.sentences.length
        });
        
        // If speaking, stop playback
        if (speech.isSpeaking) {
          appState.setHotkeyFeedback(true);
          setTimeout(() => appState.setHotkeyFeedback(false), 200);
          speech.stop();
        }
        // If not speaking and there are sentences, start speaking current sentence
        else if (speech.sentences.length > 0) {
          // Visual feedback for hotkey press
          appState.setHotkeyFeedback(true);
          setTimeout(() => appState.setHotkeyFeedback(false), 200);
          
          if (speech.isSpeaking) {
            speech.stop();
            setTimeout(() => {
              speech.speakCurrentSentence();
            }, 100);
          } else {
            speech.speakCurrentSentence();
          }
        } else {
          console.debug('Space hotkey Not triggering - no sentences available');
        }
      }
    },
    [speech, appState]
  );

  // Handle dictation completion
  const handleDictationComplete = useCallback(() => {
    // Use the dictation context's onComplete method
    dictation.onComplete();
  }, [dictation]);

  // Handle real-time input updates for all sentences
  const handleRealTimeInputUpdate = useCallback((_sentence: string, _sentenceIndex: number, _input: string) => {
    // This is a placeholder - the actual implementation will be in the parent component
    // that manages the real-time inputs state
  }, []);

  // Set up global keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);

  const value: EventHandlersContextType = {
    handleWordClick,
    handleSentenceClick,
    handleClick,
    handleKeyDown,
    handleDictationComplete,
    handleRealTimeInputUpdate,
  };

  return (
    <EventHandlersContext.Provider value={value}>
      {children}
    </EventHandlersContext.Provider>
  );
}; 
