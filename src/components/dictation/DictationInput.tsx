import React, { useState, useEffect, useRef } from "react";
import { useDictationStorage } from "../../hooks/useDictationStorage";
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
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { saveDictationInput, isLoaded } = useDictationStorage();

  // Update cursor position when input changes
  const updateCursorPosition = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Check if we should auto-add a space after a completed word
    const shouldAddSpace = DictationService.shouldAutoSpace(targetText, filteredValue);
    
    const newValue = shouldAddSpace ? filteredValue + ' ' : filteredValue;
    setUserInput(newValue);
    onInputChange?.(newValue);
    
    // Update cursor position after input change
    setTimeout(updateCursorPosition, 0);
  };

  const handleKeyDown = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // Update cursor position after key events
    setTimeout(updateCursorPosition, 0);
  };

  const handleKeyUp = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // Update cursor position after key events
    setTimeout(updateCursorPosition, 0);
  };

  const handleClick = (_e: React.MouseEvent<HTMLInputElement>) => {
    // Update cursor position after mouse events
    setTimeout(updateCursorPosition, 0);
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
