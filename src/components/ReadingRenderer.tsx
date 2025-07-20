import React, { useRef } from 'react';
import { useSpeechContext } from '../contexts/SpeechContext';
import { useEventHandlersContext } from '../contexts/EventHandlersContext';
import { useTextManagement } from '../hooks/useTextManagement';

export const ReadingRenderer: React.FC = () => {
  const speech = useSpeechContext();
  const eventHandlers = useEventHandlersContext();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Text management for reading mode
  const textManagement = useTextManagement();

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
        onClick={eventHandlers.handleClick}
        dangerouslySetInnerHTML={{
          __html: textManagement.processedHtml,
        }}
        className="prose-reading text-stone-800"
      />
    </div>
  );
}; 
