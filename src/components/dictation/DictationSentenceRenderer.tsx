import React from "react";
import { DictationInput } from "./DictationInput";
import { DictationDisplayUtils } from "../../utils/dictationDisplay";
import { DictationSentenceRendererProps, SentenceDisplayProps } from "../../types/dictation";
import { useEventHandlersContext } from "../../contexts/EventHandlersContext";

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  sentence,
  sentenceIndex,
  isActive,
  isCurrentSentence,
  isSpeaking,
  storedInput,
  activeInput,
  onInputUpdate,
  onDictationComplete,
}) => {
  const generateProgressDisplay = (): React.ReactNode[] => {
    const displayInput = activeInput || storedInput;
    return DictationDisplayUtils.generateMaskedDisplay(sentence.trim(), displayInput);
  };



  const shouldHighlight = isCurrentSentence && (isSpeaking || true);
  const sentenceClass = shouldHighlight
    ? "current-sentence bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg shadow-sm"
    : "sentence cursor-pointer hover:bg-gray-50 rounded-lg transition-colors";

  return (
    <div className={sentenceClass} data-sentence-index={sentenceIndex}>
      {isActive ? (
        <div className="dictation-active-sentence p-4 rounded-lg">
          <DictationInput
            targetText={sentence}
            sentenceIndex={sentenceIndex}
            isVisible={true}
            onComplete={onDictationComplete}
            onInputChange={(input) => onInputUpdate(sentence, sentenceIndex, input)}
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

export const DictationSentenceRenderer: React.FC<DictationSentenceRendererProps> = ({
  sentences,
  dictationSentenceIndex,
  currentSentenceIndex,
  isSpeaking,
  storedInputs,
  activeInputs,
  onInputUpdate,
  onDictationComplete,
}) => {
  const eventHandlers = useEventHandlersContext();

  return (
    <div onClick={eventHandlers.handleClick}>
      {sentences.map((sentence, index) => {
        const sentenceId = DictationDisplayUtils.generateSentenceId(sentence.trim(), index);
        const storedInput = storedInputs[sentenceId] || '';
        const activeInput = activeInputs[sentenceId] || '';
        const isActive = dictationSentenceIndex === index;
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
            onInputUpdate={onInputUpdate}
            onDictationComplete={onDictationComplete}
          />
        );
      })}
    </div>
  );
}; 
