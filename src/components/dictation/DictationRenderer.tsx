import React from 'react';
import { useDictationContext } from '../../contexts/DictationContext';
import { useSpeechContext } from '../../contexts/SpeechContext';
import { DictationSentenceRenderer } from './DictationSentenceRenderer';
import { WrongWordSaveButton } from './WrongWordSaveButton';

export const DictationRenderer: React.FC = () => {
  const dictation = useDictationContext();
  const speech = useSpeechContext();

  // Don't render if no text is loaded
  if (!speech.originalText.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <p>No text loaded for dictation practice.</p>
          <p className="text-sm mt-2">Please load some text to begin dictation mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <DictationSentenceRenderer
        sentences={speech.sentences}
        dictationSentenceIndex={dictation.currentSentenceIndex}
        currentSentenceIndex={speech.currentSentenceIndex}
        isSpeaking={speech.isSpeaking}
        storedInputs={dictation.storedInputs}
        activeInputs={dictation.activeInputs}
        onInputUpdate={dictation.updateInput}
        onDictationComplete={dictation.onComplete}
      />
      <WrongWordSaveButton />
    </div>
  );
}; 
