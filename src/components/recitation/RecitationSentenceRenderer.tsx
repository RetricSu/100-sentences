import React from "react";
import { RecitationInput } from "./RecitationInput";
import { RecitationDisplayUtils } from "../../utils/recitationDisplay";
import { RecitationSentenceRendererProps, SentenceDisplayProps } from "../../types/recitation";
import { useEventHandlersContext } from "../../contexts/EventHandlersContext";

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  sentence,
  sentenceIndex,
  isActive,
  isCurrentSentence,
  isSpeaking,
  storedInput,
  activeInput,
  onRecitationComplete,
}) => {
  const generateProgressDisplay = (): React.ReactNode[] => {
    const displayInput = activeInput || storedInput;
    return RecitationDisplayUtils.generateMaskedDisplay(sentence.trim(), displayInput);
  };

  const shouldHighlight = isCurrentSentence && (isSpeaking || true);
  const sentenceClass = shouldHighlight
    ? "current-sentence bg-emerald-100 border-l-4 border-emerald-400 rounded-r-lg shadow-sm"
    : "sentence cursor-pointer hover:bg-emerald-50 rounded-lg transition-colors";

  return (
    <div className={sentenceClass} data-sentence-index={sentenceIndex}>
      {isActive ? (
        <div 
          className="recitation-active-sentence p-4 rounded-lg"
          onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
        >
          <RecitationInput
            targetText={sentence}
            sentenceIndex={sentenceIndex}
            isVisible={true}
            onComplete={onRecitationComplete}
            initialInput={activeInput || storedInput}
            className=""
          />
        </div>
      ) : (
        <div className="font-mono text-lg tracking-wider mb-2">
          {generateProgressDisplay()}
        </div>
      )}
    </div>
  );
};

export const RecitationSentenceRenderer: React.FC<RecitationSentenceRendererProps> = ({
  sentences,
  recitationSentenceIndex,
  currentSentenceIndex,
  isSpeaking,
  storedInputs,
  activeInputs,
  onRecitationComplete,
}) => {
  const eventHandlers = useEventHandlersContext();

  return (
    <div onClick={eventHandlers.handleClick}>
      {sentences.map((sentence, index) => {
        const sentenceId = RecitationDisplayUtils.generateSentenceId(sentence.trim(), index);
        const storedInput = storedInputs[sentenceId] || '';
        const activeInput = activeInputs[sentenceId] || '';
        const isActive = recitationSentenceIndex === index;
        const isCurrentSentence = index === currentSentenceIndex;

        return (
          <SentenceDisplay
            key={`sentence-${index}`}
            sentence={sentence}
            sentenceIndex={index}
            isActive={isActive}
            isCurrentSentence={isCurrentSentence}
            isSpeaking={isSpeaking}
            storedInput={storedInput}
            activeInput={activeInput}
            onRecitationComplete={onRecitationComplete}
          />
        );
      })}
    </div>
  );
}; 
