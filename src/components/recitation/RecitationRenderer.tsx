import React from 'react';
import { useRecitationContext } from '../../contexts/RecitationContext';
import { useSpeechContext } from '../../contexts/SpeechContext';
import { RecitationSentenceRenderer } from './RecitationSentenceRenderer';
import { RecitationMicrophone } from './RecitationMicrophone';

export const RecitationRenderer: React.FC = () => {
  const recitation = useRecitationContext();
  const speech = useSpeechContext();

  // Don't render if no text is loaded
  if (!speech.originalText.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <p>No text loaded for recitation practice.</p>
          <p className="text-sm mt-2">Please load some text to begin recitation mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <RecitationSentenceRenderer
        sentences={speech.sentences}
        recitationSentenceIndex={recitation.currentSentenceIndex}
        currentSentenceIndex={speech.currentSentenceIndex}
        isSpeaking={speech.isSpeaking}
        storedInputs={recitation.storedInputs}
        activeInputs={recitation.activeInputs}
        onRecitationComplete={recitation.onComplete}
      />
      <RecitationMicrophone />
    </div>
  );
}; 
