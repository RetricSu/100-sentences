import React, { useRef } from 'react';
import { DictationSentenceRenderer } from './DictationSentenceRenderer';

interface TextRendererProps {
  isDictationMode: boolean;
  processedHtml: string;
  speech: any;
  dictationSentenceIndex: number | null;
  dictationInputs: Record<string, string>;
  realTimeInputs: Record<string, string>;
  onRealTimeInputUpdate: (sentence: string, sentenceIndex: number, input: string) => void;
  onDictationComplete: () => void;
  onClick: (event: React.MouseEvent) => void;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
  isDictationMode,
  processedHtml,
  speech,
  dictationSentenceIndex,
  dictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
  onDictationComplete,
  onClick,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

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
