import React, { useRef } from 'react';
import { DictationSentenceRenderer } from './DictationSentenceRenderer';
import { useAppStateContext } from '../contexts/AppStateContext';

interface TextRendererProps {
  processedHtml: string;
  speech: any;
  dictationInputs: Record<string, string>;
  realTimeInputs: Record<string, string>;
  onRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
  onDictationComplete: () => void;
  onClick: (event: React.MouseEvent) => void;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
  processedHtml,
  speech,
  dictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
  onDictationComplete,
  onClick,
}) => {
  const appState = useAppStateContext();
  const contentRef = useRef<HTMLDivElement>(null);

  // Get values from context
  const { isDictationMode, dictationSentenceIndex } = appState;

  if (isDictationMode && speech.originalText.trim()) {
    // Dictation mode: Use React components for declarative rendering
    return (
      <div
        ref={contentRef}
        onClick={onClick}
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
      onClick={onClick}
      dangerouslySetInnerHTML={{
        __html: processedHtml,
      }}
      className="prose-reading text-stone-800"
    />
  );
}; 
