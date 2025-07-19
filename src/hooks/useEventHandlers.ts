import { useCallback } from 'react';
import { TextProcessor } from '../services/textProcessor';

interface UseEventHandlersProps {
  speech: any;
  isDictationMode: boolean;
  dictationSentenceIndex: number | null;
  appState: {
    showDictionary: (word: string) => void;
    setDictationSentence: (index: number | null) => void;
    setHotkeyFeedback: (pressed: boolean) => void;
  };
  lookupWord: (word: string) => Promise<any>;
}

export const useEventHandlers = ({
  speech,
  isDictationMode,
  dictationSentenceIndex,
  appState,
  lookupWord,
}: UseEventHandlersProps) => {
  const handleWordClick = useCallback(
    async (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("word")) {
        const word = TextProcessor.extractCleanWord(target.textContent || "");
        if (!word) return;

        // Speak the word
        speech.speak(word);

        // Show dictionary popup
        appState.showDictionary(word);

        // Lookup word
        try {
          const result = await lookupWord(word);
          // We'll need to handle this result in the parent component
          return result;
        } catch (error) {
          console.error("Error looking up word:", error);
        }
      }
    },
    [speech, appState, lookupWord]
  );

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
          
          if (isDictationMode) {
            // Check if clicking on the currently active dictation sentence
            if (dictationSentenceIndex === sentenceIndex) {
              // Just speak the sentence without changing dictation state
              // This preserves focus on the input field
              setTimeout(() => {
                speech.speak(speech.sentences[sentenceIndex], sentenceIndex);
              }, 100);
            } else {
              // Set this sentence for dictation (different sentence)
              appState.setDictationSentence(sentenceIndex);
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
    [speech, isDictationMode, dictationSentenceIndex, appState]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      handleWordClick(event);
      handleSentenceClick(event);
    },
    [handleWordClick, handleSentenceClick]
  );

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

  return {
    handleWordClick,
    handleSentenceClick,
    handleClick,
    handleKeyDown,
  };
}; 
