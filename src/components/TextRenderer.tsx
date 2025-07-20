import React, { useRef } from 'react';
import { DictationSentenceRenderer } from './DictationSentenceRenderer';
import { useAppStateContext } from '../contexts/AppStateContext';
import { useSpeechContext } from '../contexts/SpeechContext';
import { useEventHandlersContext } from '../contexts/EventHandlersContext';

interface TextRendererProps {
  processedHtml: string;
  dictationInputs: Record<string, string>;
  realTimeInputs: Record<string, string>;
  onRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
  onDictationComplete: () => void;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
  processedHtml,
  dictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
  onDictationComplete,
}) => {
  const appState = useAppStateContext();
  const speech = useSpeechContext();
  const eventHandlers = useEventHandlersContext();
  const contentRef = useRef<HTMLDivElement>(null);

  // Get values from context
  const { isDictationMode, dictationSentenceIndex } = appState;

  if (isDictationMode && speech.originalText.trim()) {
    // Dictation mode: Use React components for declarative rendering
    return (
      <div
        ref={contentRef}
        onClick={eventHandlers.handleClick}
        className="prose-reading text-stone-800"
      >
        <DictationSentenceRenderer
          sentences={speech.sentences}
          dictationSentenceIndex={dictationSentenceIndex}
          currentSentenceIndex={speech.currentSentenceIndex}
          isSpeaking={speech.isSpeaking}
          savedDictationInputs={dictationInputs}
          realTimeInputs={realTimeInputs}
          onRealTimeInputUpdate={onRealTimeInputUpdate}
          onDictationComplete={onDictationComplete}
        />
      </div>
    );
  }

  // Normal mode: Use HTML rendering
  return (
    <div
      ref={contentRef}
      onClick={eventHandlers.handleClick}
      dangerouslySetInnerHTML={{
        __html: processedHtml,
      }}
      className="prose-reading text-stone-800"
    />
  );
}; 
