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
  onInputChange,
  initialInput = "",
  className = "",
}) => {
  const [userInput, setUserInput] = useState(initialInput);
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { saveDictationInput, isLoaded } = useDictationStorage();




  // Save current text when sentence changes
  useEffect(() => {
    return () => {
      // Save current text when component unmounts or sentence changes
      if (isLoaded) {
        saveDictationInput(targetText, sentenceIndex, userInput);
      }
    };
  }, [targetText, sentenceIndex, saveDictationInput, isLoaded, userInput]);

  // Handle user input changes: immediate display update, saving, and parent notification
  useEffect(() => {
    if (!isLoaded) return;
    
    // Check completion immediately for responsive UI
    const isCompleted = DictationService.checkCompletion(targetText, userInput);
    if (isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    } else {
      setIsCompleted(false);
    }
    
    // Save to storage
    saveDictationInput(targetText, sentenceIndex, userInput);
    
    // Notify parent of real-time changes
    onInputChange?.(userInput);
  }, [targetText, sentenceIndex, saveDictationInput, isLoaded, onComplete, onInputChange]);




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Check if we should auto-add a space after a completed word
    const shouldAddSpace = DictationService.shouldAutoSpace(targetText, filteredValue);
    
    const newValue = shouldAddSpace ? filteredValue + ' ' : filteredValue;
    setUserInput(newValue);
    onInputChange?.(newValue);
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
