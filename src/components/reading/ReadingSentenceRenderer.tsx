import React from "react";
import { useEventHandlersContext } from "../../contexts/EventHandlersContext";

interface ReadingSentenceRendererProps {
  sentences: string[];
  currentSentenceIndex: number;
  isSpeaking: boolean;
  onSentenceClick: (event: React.MouseEvent) => void;
  onWordClick: (event: React.MouseEvent) => void;
}

interface SentenceDisplayProps {
  sentence: string;
  sentenceIndex: number;
  isCurrentSentence: boolean;
  isSpeaking: boolean;
  onClick: (event: React.MouseEvent) => void;
  onWordClick: (event: React.MouseEvent) => void;
}

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  sentence,
  sentenceIndex,
  isCurrentSentence,
  isSpeaking,
  onClick,
  onWordClick
}) => {
  const words = sentence.trim().split(/\s+/);
  const shouldHighlight = isCurrentSentence && (isSpeaking || sentenceIndex > 0);
  
  const sentenceClass = shouldHighlight
    ? "current-sentence bg-emerald-100 border-l-4 border-emerald-400 pl-4 rounded-r-lg shadow-sm break-words"
    : "sentence cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 rounded-lg transition-colors break-words";

  return (
    <div 
      className={sentenceClass} 
      data-sentence-index={sentenceIndex}
      onClick={onClick}
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%'
      }}
    >
      {words.map((word, wordIndex) => (
        <span 
          key={`${sentenceIndex}-${wordIndex}`} 
          className="word cursor-pointer px-1 py-1 rounded-md hover:bg-emerald-100 hover:text-emerald-700 transition-colors duration-200 hover:shadow-sm"
          onClick={onWordClick}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export const ReadingSentenceRenderer: React.FC<ReadingSentenceRendererProps> = ({
  sentences,
  currentSentenceIndex,
  isSpeaking,
  onSentenceClick,
  onWordClick,
}) => {
  const eventHandlers = useEventHandlersContext();

  return (
    <div onClick={eventHandlers.handleClick}>
      {sentences.map((sentence, index) => (
        <SentenceDisplay
          key={`sentence-${index}`}
          sentence={sentence}
          sentenceIndex={index}
          isCurrentSentence={index === currentSentenceIndex}
          isSpeaking={isSpeaking}
          onClick={onSentenceClick}
          onWordClick={onWordClick}
        />
      ))}
    </div>
  );
}; 
