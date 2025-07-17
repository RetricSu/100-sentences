import React, { useState, useEffect, useRef } from "react";
import { useDictationStorage } from "../hooks/useDictationStorage";
import { DictationDisplayUtils } from "../utils/dictationDisplay";
import { DictationService } from "../services/dictationService";
import { DictationInputProps } from "../types/dictation";

export const DictationInput: React.FC<DictationInputProps> = ({
  targetText,
  sentenceIndex,
  isVisible,
  onComplete,
  className = "",
}) => {
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { getDictationInput, saveDictationInput, isLoaded } = useDictationStorage();



  // Handle sentence/text changes: reset state and load saved input
  useEffect(() => {
    // Reset initialization when sentence changes
    setHasInitialized(false);
    
    // Load saved input when storage is ready and component initializes
    if (isLoaded && isVisible) {
      const savedInput = getDictationInput(targetText, sentenceIndex);
      setUserInput(savedInput);
      setHasInitialized(true);
      
      // Focus the input when it becomes visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLoaded, isVisible, targetText, sentenceIndex, getDictationInput]);

  // Handle user input changes: save input, check completion, and auto-space
  useEffect(() => {
    if (!hasInitialized || !isLoaded) return;
    
    // Save input whenever it changes
    saveDictationInput(targetText, sentenceIndex, userInput);
    
    // Check if completed
    const isCompleted = DictationService.checkCompletion(targetText, userInput);
    if (isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    } else {
      setIsCompleted(false);
    }
    
    // Auto-complete spaces when word is finished
    if (DictationService.shouldAutoSpace(targetText, userInput)) {
      setUserInput(userInput + ' ');
    }
  }, [userInput, targetText, sentenceIndex, saveDictationInput, hasInitialized, isLoaded, onComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    setUserInput(filteredValue);
  };



  const handleKeyDown = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow all keys for typing
    return;
  };

  // Generate display text with word-by-word progression
  const generateDisplayText = () => {
    if (!targetText) return "";

    const cursorPosition = DictationService.getNextCharacterPosition(targetText, userInput);
    return DictationDisplayUtils.generateMaskedDisplay(targetText, userInput, {
      showCursor: true,
      cursorPosition
    });
  };

  if (!isVisible) return null;

  return (
    <div className={`dictation-input-container ${className}`}>
      {/* Invisible input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Visual display that looks like writing on underscores */}
      <div
        className="font-mono text-lg leading-relaxed tracking-wider cursor-text relative"
        onClick={() => inputRef.current?.focus()}
      >
        {generateDisplayText()}
      </div>

      {/* Progress indicator */}
      {isCompleted && (
        <div className="mt-2 text-sm text-green-600 font-medium">
          ✓ Completed!
        </div>
      )}
    </div>
  );
};
