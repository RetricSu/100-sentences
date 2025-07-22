import React, { useState, useEffect } from "react";
import { useDictationStorage } from "../../hooks/useDictationStorage";
import { useCursorPosition } from "../../hooks/useCursorPosition";
import { DictationDisplayUtils } from "../../utils/dictationDisplay";
import { DictationService } from "../../services/dictationService";
import { DictationInputProps } from "../../types/dictation";

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
  
  const { cursorPosition, inputRef, handleCursorEvent } = useCursorPosition();
  const { saveDictationInput, isLoaded } = useDictationStorage();

  // Save current text when component unmounts or sentence changes
  useEffect(() => {
    return () => {
      // Save current text when component unmounts
      if (isLoaded) {
        saveDictationInput(targetText, sentenceIndex, userInput);
      }
    };
  }, [targetText, sentenceIndex, saveDictationInput, isLoaded]);

  // Handle user input changes: immediate display update, completion check, and parent notification
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
    
    // Notify parent of real-time changes
    onInputChange?.(userInput);
  }, [targetText, sentenceIndex, isLoaded, onComplete, onInputChange, userInput]);

  // Focus input when it becomes visible and maintain focus
  useEffect(() => {
    if (isVisible && isLoaded) {
      // Use a small delay to ensure the DOM is ready
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isVisible, isLoaded]);

  // Maintain focus when input loses focus (unless component is unmounting)
  useEffect(() => {
    if (!isVisible || !isLoaded) return;

    const handleFocusLoss = () => {
      // Small delay to ensure we don't interfere with legitimate focus changes
      setTimeout(() => {
        if (isVisible && isLoaded && inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('blur', handleFocusLoss);
      return () => inputElement.removeEventListener('blur', handleFocusLoss);
    }
  }, [isVisible, isLoaded]);

  // Global click handler to refocus input when clicking outside
  useEffect(() => {
    if (!isVisible || !isLoaded) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't refocus if clicking on the input itself or its container
      if (inputRef.current?.contains(target) || 
          target.closest('.dictation-input-container') ||
          target.closest('.dictation-active-sentence')) {
        return;
      }
      
      // Small delay to ensure the click event has processed
      setTimeout(() => {
        if (isVisible && isLoaded && inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [isVisible, isLoaded]);

  // Save current state before page unload
  useEffect(() => {
    if (!isVisible || !isLoaded) return;

    const handleBeforeUnload = () => {
      if (userInput.trim()) {
        saveDictationInput(targetText, sentenceIndex, userInput);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isVisible, isLoaded, userInput, targetText, sentenceIndex, saveDictationInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Get target letter count (excluding spaces and punctuation)
    const targetLetterCount = DictationService.getTargetLetterCount(targetText);
    const currentLetterCount = filteredValue.replace(/\s+/g, '').length;
    
    // Check if adding this input would exceed the target length
    if (currentLetterCount > targetLetterCount) {
      // Truncate to target length
      const truncatedValue = truncateToTargetLength(filteredValue, targetLetterCount);
      setUserInput(truncatedValue);
      onInputChange?.(truncatedValue);
      
      // Save to storage immediately
      if (isLoaded) {
        saveDictationInput(targetText, sentenceIndex, truncatedValue);
      }
    } else {
      // Check if we should auto-add a space after a completed word
      const shouldAddSpace = DictationService.shouldAutoSpace(targetText, filteredValue);
      
      const newValue = shouldAddSpace ? filteredValue + ' ' : filteredValue;
      setUserInput(newValue);
      onInputChange?.(newValue);
      
      // Save to storage immediately
      if (isLoaded) {
        saveDictationInput(targetText, sentenceIndex, newValue);
      }
    }
    
    // Update cursor position after input change
    handleCursorEvent();
  };

  // Helper method to truncate input to target length
  const truncateToTargetLength = (input: string, targetLength: number): string => {
    const letters = input.replace(/\s+/g, '');
    if (letters.length <= targetLength) {
      return input;
    }
    
    // Truncate letters to target length
    const truncatedLetters = letters.substring(0, targetLength);
    
    // Reconstruct the string with spaces in their original positions
    let result = '';
    let letterIndex = 0;
    
    for (let i = 0; i < input.length && letterIndex < targetLength; i++) {
      if (input[i] === ' ') {
        result += ' ';
      } else {
        result += truncatedLetters[letterIndex];
        letterIndex++;
      }
    }
    
    return result;
  };

  const handleKeyDown = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // Update cursor position after key events
    handleCursorEvent();
  };

  const handleKeyUp = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // Update cursor position after key events
    handleCursorEvent();
  };

  const handleClick = (_e: React.MouseEvent<HTMLInputElement>) => {
    // Update cursor position after mouse events
    handleCursorEvent();
  };

  // Generate display text with word-by-word progression
  const generateDisplayText = () => {
    if (!targetText) return "";

    // Convert cursor position to letter position (excluding spaces)
    const letterPosition = userInput.substring(0, cursorPosition).replace(/[^a-zA-Z]/g, '').length;
    
    return DictationDisplayUtils.generateMaskedDisplay(targetText, userInput, {
      showCursor: true,
      cursorPosition: letterPosition
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`dictation-input-container ${className}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent click from bubbling up to parent
        inputRef.current?.focus();
      }}
    >
      {/* Invisible input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        className="absolute opacity-0"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Visual display that looks like writing on underscores */}
      <div
        className="font-mono text-lg leading-relaxed tracking-wider cursor-text relative"
        onClick={(e) => {
          e.stopPropagation(); // Prevent click from bubbling up to parent
          inputRef.current?.focus();
        }}
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
