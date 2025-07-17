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
  
  // Track the current sentence to prevent overwriting user input
  const prevSentenceRef = useRef({ targetText, sentenceIndex });



  // Handle sentence/text changes: load saved input
  useEffect(() => {
    if (isLoaded && isVisible) {
      const savedInput = getDictationInput(targetText, sentenceIndex);
      
      // Check if this is actually a new sentence
      const isNewSentence = prevSentenceRef.current.targetText !== targetText || 
                           prevSentenceRef.current.sentenceIndex !== sentenceIndex;
      
      if (isNewSentence || !userInput) {
        setUserInput(savedInput);
      }
      
      // Update the ref for next comparison
      prevSentenceRef.current = { targetText, sentenceIndex };
      setHasInitialized(true);
      
      // Focus the input when it becomes visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLoaded, isVisible, targetText, sentenceIndex, getDictationInput, userInput]);

  // Save current text when sentence changes
  useEffect(() => {
    return () => {
      // Save current text when component unmounts or sentence changes
      if (hasInitialized && isLoaded) {
        saveDictationInput(targetText, sentenceIndex, userInput);
      }
    };
  }, [targetText, sentenceIndex, saveDictationInput, hasInitialized, isLoaded, userInput]);

  // Handle user input changes: immediate display update and saving
  useEffect(() => {
    if (!hasInitialized || !isLoaded) return;
    
    // Check completion immediately for responsive UI
    const isCompleted = DictationService.checkCompletion(targetText, userInput);
    if (isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    } else {
      setIsCompleted(false);
    }
    
    // Save immediately without debounce
    saveDictationInput(targetText, sentenceIndex, userInput);
  }, [targetText, sentenceIndex, saveDictationInput, hasInitialized, isLoaded, onComplete]);




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Check if we should auto-add a space after a completed word
    const shouldAddSpace = DictationService.shouldAutoSpace(targetText, filteredValue);
    
    if (shouldAddSpace) {
      setUserInput(filteredValue + ' ');
    } else {
      setUserInput(filteredValue);
    }
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
