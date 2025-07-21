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

  // Check completion and save to storage when userInput changes
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

    // Save to storage
    saveRecitationInput(targetText, sentenceIndex, userInput);
  }, [
    targetText,
    sentenceIndex,
    saveRecitationInput,
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
      <div className="mt-4 text-left">
        {userInput && (
          <div className="text-gray-400 font-medium text-sm">{userInput}</div>
        )}
      </div>

      {/* Progress indicator */}
      {isCompleted && (
        <div className="mt-2 text-sm text-green-600 font-medium text-center">
          ✓ Completed!
        </div>
      )}
    </div>
  );
};
