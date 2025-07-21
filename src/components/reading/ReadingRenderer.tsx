import React, { useRef } from 'react';
import { useSpeechContext } from '../../contexts/SpeechContext';
import { useEventHandlersContext } from '../../contexts/EventHandlersContext';
import { ReadingSentenceRenderer } from './ReadingSentenceRenderer';

export const ReadingRenderer: React.FC = () => {
  const speech = useSpeechContext();
  const eventHandlers = useEventHandlersContext();
  const contentRef = useRef<HTMLDivElement>(null);

  // Don't render if no text is loaded
  if (!speech.originalText.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <p>No text loaded for reading.</p>
          <p className="text-sm mt-2">Please load some text to begin reading.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <div
        ref={contentRef}
        className="prose-reading text-stone-800 max-w-none mx-auto px-4 sm:px-6 lg:px-8"
        style={{ 
          maxWidth: '100%',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        <ReadingSentenceRenderer
          sentences={speech.sentences}
          currentSentenceIndex={speech.currentSentenceIndex}
          isSpeaking={speech.isSpeaking}
          onSentenceClick={eventHandlers.handleSentenceClick}
          onWordClick={eventHandlers.handleWordClick}
        />
      </div>
    </div>
  );
}; 
