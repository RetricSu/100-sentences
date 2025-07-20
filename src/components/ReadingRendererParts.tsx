import React from 'react';

// Word component for individual clickable words
export const Word: React.FC<{ 
  word: string; 
  onClick: (event: React.MouseEvent) => void 
}> = ({ 
  word, 
  onClick 
}) => (
  <span 
    className="word cursor-pointer px-1 py-1 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 hover:shadow-sm"
    onClick={onClick}
  >
    {word}
  </span>
);

// Sentence component for individual sentences
export const Sentence: React.FC<{
  sentence: string;
  sentenceIndex: number;
  isCurrentSentence: boolean;
  isSpeaking: boolean;
  onClick: (event: React.MouseEvent) => void;
  onWordClick: (event: React.MouseEvent) => void;
}> = ({ 
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
    ? "current-sentence bg-yellow-50 border-l-4 border-yellow-400 pl-4 rounded-r-lg shadow-sm"
    : "sentence cursor-pointer hover:bg-yellow-50 hover:border-yellow-400 rounded-lg transition-colors";

  return (
    <div 
      className={sentenceClass} 
      data-sentence-index={sentenceIndex}
      onClick={onClick}
    >
      {words.map((word, wordIndex) => (
        <Word 
          key={`${sentenceIndex}-${wordIndex}`} 
          word={word} 
          onClick={onWordClick}
        />
      ))}
    </div>
  );
};

// Paragraph component
export const Paragraph: React.FC<{
  sentences: string[];
  sentenceIndices: number[];
  currentSentenceIndex: number;
  isSpeaking: boolean;
  onSentenceClick: (event: React.MouseEvent) => void;
  onWordClick: (event: React.MouseEvent) => void;
  isFirstParagraph: boolean;
}> = ({ 
  sentences, 
  sentenceIndices, 
  currentSentenceIndex, 
  isSpeaking, 
  onSentenceClick, 
  onWordClick,
  isFirstParagraph 
}) => {
  const paragraphClass = isFirstParagraph
    ? "paragraph-block mb-8 first:mb-8"
    : "paragraph-block mb-8 pt-4 border-t border-gray-100";

  return (
    <div className={paragraphClass}>
      {sentences.map((sentence, index) => (
        <Sentence
          key={`sentence-${sentenceIndices[index]}`}
          sentence={sentence}
          sentenceIndex={sentenceIndices[index]}
          isCurrentSentence={sentenceIndices[index] === currentSentenceIndex}
          isSpeaking={isSpeaking}
          onClick={onSentenceClick}
          onWordClick={onWordClick}
        />
      ))}
    </div>
  );
}; 
