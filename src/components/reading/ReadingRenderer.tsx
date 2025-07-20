import React, { useRef } from 'react';
import { useSpeechContext } from '../../contexts/SpeechContext';
import { useEventHandlersContext } from '../../contexts/EventHandlersContext';
import { Paragraph } from './ReadingRendererParts';
import { processTextToStructuredData } from '../../utils/textProcessing';

export const ReadingRenderer: React.FC = () => {
  const speech = useSpeechContext();
  const eventHandlers = useEventHandlersContext();
  const contentRef = useRef<HTMLDivElement>(null);

  // Process text into structured data instead of HTML
  const processedContent = React.useMemo(() => {
    return processTextToStructuredData(speech.originalText);
  }, [speech.originalText]);

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
    <div className="flex-1">
      <div
        ref={contentRef}
        className="prose-reading text-stone-800"
      >
        {processedContent?.paragraphs.map((paragraph, paragraphIndex) => (
          <Paragraph
            key={`paragraph-${paragraphIndex}`}
            sentences={paragraph.sentences}
            sentenceIndices={paragraph.sentenceIndices}
            currentSentenceIndex={speech.currentSentenceIndex}
            isSpeaking={speech.isSpeaking}
            onSentenceClick={eventHandlers.handleSentenceClick}
            onWordClick={eventHandlers.handleWordClick}
            isFirstParagraph={paragraph.isFirstParagraph}
          />
        ))}
      </div>
    </div>
  );
}; 
