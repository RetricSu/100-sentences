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
        className="absolute opacity-0 pointer-events-none"
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
