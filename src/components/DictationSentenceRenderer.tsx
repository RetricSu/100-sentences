import React from "react";
import { DictationInput } from "./DictationInput";
import { DictationDisplayUtils } from "../utils/dictationDisplay";
import { DictationSentenceRendererProps, SentenceDisplayProps } from "../types/dictation";

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
  sentence,
  sentenceIndex,
  isActive,
  isCurrentSentence,
  isSpeaking,
  savedInput,
  realTimeInput,
  onRealTimeInputUpdate,
  onDictationComplete,
}) => {
  const generateProgressDisplay = (): React.ReactNode[] => {
    const displayInput = realTimeInput || savedInput;
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
            onInputChange={(input) => onRealTimeInputUpdate(sentence, sentenceIndex, input)}
            initialInput={realTimeInput || savedInput}
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
  savedDictationInputs,
  realTimeInputs,
  onRealTimeInputUpdate,
  onDictationComplete,
}) => {
  return (
    <>
      {sentences.map((sentence, index) => {
        const sentenceId = DictationDisplayUtils.generateSentenceId(sentence.trim(), index);
        const savedInput = savedDictationInputs[sentenceId] || '';
        const realTimeInput = realTimeInputs[sentenceId] || '';
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
            savedInput={savedInput}
            realTimeInput={realTimeInput}
            onRealTimeInputUpdate={onRealTimeInputUpdate}
            onDictationComplete={onDictationComplete}
          />
        );
      })}
    </>
  );
}; 
