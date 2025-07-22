import React, { useState, useEffect, useMemo } from "react";
import { useRecitationStorage } from "../../hooks/useRecitationStorage";
import { RecitationDisplayUtils } from "../../utils/recitationDisplay";
import { RecitationService } from "../../services/recitationService";
import { RecitationInputProps } from "../../types/recitation";
import { useRecitationContext } from "../../contexts/RecitationContext";

export const RecitationInput: React.FC<RecitationInputProps> = ({
  targetText,
  sentenceIndex,
  isVisible,
  onComplete,
  initialInput = "",
  className = "",
}) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const { saveRecitationInput, isLoaded } = useRecitationStorage();
  const recitation = useRecitationContext();

  // Get the current input from context
  const sentenceId = useMemo(
    () =>
      RecitationDisplayUtils.generateSentenceId(
        targetText.trim(),
        sentenceIndex
      ),
    [targetText, sentenceIndex]
  );
  const userInput = recitation.activeInputs[sentenceId] || initialInput;

  // Save current text when component unmounts
  useEffect(() => {
    return () => {
      // Save current text when component unmounts
      if (isLoaded && userInput.trim()) {
        saveRecitationInput(targetText, sentenceIndex, userInput);
      }
    };
  }, [targetText, sentenceIndex, saveRecitationInput, isLoaded, userInput]);

  // Save current state before page unload
  useEffect(() => {
    if (!isVisible || !isLoaded) return;

    const handleBeforeUnload = () => {
      if (userInput.trim()) {
        saveRecitationInput(targetText, sentenceIndex, userInput);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isVisible, isLoaded, userInput, targetText, sentenceIndex, saveRecitationInput]);

  // Get word matching information
  const matchingInfo = useMemo(() => {
    if (!userInput.trim()) return null;
    return RecitationDisplayUtils.getWordMatchingInfo(targetText, userInput);
  }, [targetText, userInput]);

  // Check completion when userInput changes
  useEffect(() => {
    if (!isLoaded || !userInput) return;

    // Check completion immediately for responsive UI
    const isCompleted = RecitationService.checkCompletion(
      targetText,
      userInput
    );
    if (isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    } else {
      setIsCompleted(false);
    }
  }, [
    targetText,
    sentenceIndex,
    isLoaded,
    userInput,
    onComplete,
  ]);

  // Generate display text with word-by-word progression
  const generateDisplayText = () => {
    if (!targetText) return "";

    const nextWordPosition = RecitationService.getNextWordPosition(
      targetText,
      userInput
    );
    return RecitationDisplayUtils.generateMaskedDisplay(targetText, userInput, {
      showCursor: true,
      cursorPosition: nextWordPosition,
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className={`recitation-input-container ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent any clicks from bubbling up
    >
      {/* Visual display that shows speech input */}
      <div className="font-mono text-lg leading-relaxed tracking-wider relative">
        {generateDisplayText()}
      </div>

      {/* Recognition text display */}
      <div className="flex gap-5 items-center mt-4 text-left rounded-lg">
        {/* Word matching statistics */}
        {matchingInfo && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span
                className={`font-bold px-2 py-1 rounded-md ${
                  matchingInfo.accuracy >= 80
                    ? "text-green-700 bg-green-100"
                    : matchingInfo.accuracy >= 60
                    ? "text-yellow-700 bg-yellow-100"
                    : "text-red-700 bg-red-100"
                }`}
              >
                {Math.round(matchingInfo.accuracy)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">
                <span className="text-green-600">
                  {matchingInfo.correctWords}
                </span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-800">{matchingInfo.totalWords}</span>
                <span className="text-gray-500"> correct</span>
                {matchingInfo.partialWords > 0 && (
                  <span className="text-yellow-600 ml-1">
                    , {matchingInfo.partialWords} partial
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {isCompleted && (
        <div className="mt-3 p-2 text-sm text-green-700 font-medium text-center bg-green-50 border border-green-200 rounded-lg">
          ✓ Completed!
        </div>
      )}
    </div>
  );
};
