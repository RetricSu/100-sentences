import React, { useState, useEffect, useRef } from "react";
import { useDictationStorage } from "../hooks/useDictationStorage";

interface DictationInputProps {
  targetText: string;
  sentenceIndex: number;
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}

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

  // Helper function to extract clean word without punctuation
  const extractCleanWord = (word: string): string => {
    return word.replace(/[^a-zA-Z]/g, '');
  };

  // Helper function to extract all clean words from text
  const extractCleanWords = (text: string): string[] => {
    return text.split(/\s+/).map(word => extractCleanWord(word)).filter(word => word.length > 0);
  };

  // Get the target words (only the typeable letters)
  const getTargetWords = (): string[] => {
    return extractCleanWords(targetText);
  };

  // Load saved input when storage is ready and component initializes
  useEffect(() => {
    if (isLoaded && !hasInitialized && isVisible) {
      const savedInput = getDictationInput(targetText, sentenceIndex);
      setUserInput(savedInput);
      setHasInitialized(true);
      
      // Focus the input when it becomes visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLoaded, hasInitialized, isVisible, targetText, sentenceIndex, getDictationInput]);

  // Save input whenever it changes
  useEffect(() => {
    if (hasInitialized && isLoaded) {
      saveDictationInput(targetText, sentenceIndex, userInput);
    }
  }, [userInput, targetText, sentenceIndex, saveDictationInput, hasInitialized, isLoaded]);

  // Reset initialization when sentence changes
  useEffect(() => {
    setHasInitialized(false);
  }, [sentenceIndex, targetText]);

  // Check if completed
  useEffect(() => {
    const targetWords = getTargetWords();
    const userWords = userInput.split(/\s+/).filter(word => word.length > 0);
    
    // Check if all words match (case-insensitive)
    const allWordsMatch = targetWords.length === userWords.length && 
                         targetWords.every((word, index) => word.toLowerCase() === userWords[index]?.toLowerCase());
    
    if (allWordsMatch && targetWords.length > 0) {
      setIsCompleted(true);
      onComplete?.();
    } else {
      setIsCompleted(false);
    }
  }, [userInput, targetText, onComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow letters and spaces
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    setUserInput(filteredValue);
  };

  // Auto-complete spaces when word is finished
  useEffect(() => {
    if (!userInput.trim()) return;

    const targetWords = getTargetWords();
    const userWords = userInput.split(/\s+/).filter(word => word.length > 0);
    
    if (userWords.length === 0) return;
    
    const currentWordIndex = userWords.length - 1;
    const currentUserWord = userWords[currentWordIndex];
    const currentTargetWord = targetWords[currentWordIndex];

    // If we've completed the current word exactly and there are more words to type
    if (currentTargetWord &&
        currentUserWord.toLowerCase() === currentTargetWord.toLowerCase() &&
        currentWordIndex < targetWords.length - 1 &&
        !userInput.endsWith(' ')) {
      // Auto-add the space
      setUserInput(userInput + ' ');
    }
  }, [userInput, targetText]);

  const handleKeyDown = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow all keys for typing
    return;
  };

  // Generate display text with word-by-word progression
  const generateDisplayText = () => {
    if (!targetText) return "";

    const result = [];
    
    // Create a string of all user letters (no spaces)
    const userLetters = userInput.replace(/\s+/g, '');
    
    // Split original text into tokens (words, spaces, punctuation)
    const tokens = targetText.split(/(\s+)/);
    let targetWordIndex = 0;
    let globalLetterIndex = 0; // Track position in target text (letters only)

    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      const token = tokens[tokenIndex];
      
      if (token.trim() === '') {
        // This is whitespace - always show as space
        result.push(
          <span key={tokenIndex} className="inline-block">
            {'\u00A0'}
          </span>
        );
      } else {
        // This is a word (potentially with punctuation)
        const cleanWord = extractCleanWord(token);
        
        if (cleanWord.length === 0) {
          // This token has no letters (pure punctuation) - show as-is in gray
          result.push(
            <span key={tokenIndex} className="inline-block text-gray-700">
              {token}
            </span>
          );
        } else {
          // This token has letters - process character by character
          let charResult = [];
          
          for (let charIndex = 0; charIndex < token.length; charIndex++) {
            const char = token[charIndex];
            
            if (/[a-zA-Z]/.test(char)) {
              // This is a letter
              const userChar = userLetters[globalLetterIndex];
              
              if (globalLetterIndex < userLetters.length) {
                // Character has been typed - show both underscore and typed character
                const isCorrect = userChar && userChar.toLowerCase() === char.toLowerCase();
                
                charResult.push(
                  <span key={`${tokenIndex}-${charIndex}`} className="inline-block relative min-w-[1ch]">
                    {/* Underscore background - slightly faded */}
                    <span className="text-gray-200 select-none">_</span>
                    {/* Typed character overlay - positioned to align with underscore */}
                    <span className={`absolute inset-0 flex items-center justify-center ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {userChar}
                    </span>
                  </span>
                );
              } else if (globalLetterIndex === userLetters.length) {
                // This is the next character to type - show cursor with underscore
                charResult.push(
                  <span key={`${tokenIndex}-${charIndex}`} className="inline-block min-w-[1ch] text-gray-800 bg-blue-100 animate-pulse">
                    _
                  </span>
                );
              } else {
                // Future character - show as underscore
                charResult.push(
                  <span key={`${tokenIndex}-${charIndex}`} className="inline-block min-w-[1ch] text-gray-400">
                    _
                  </span>
                );
              }
              
              globalLetterIndex++;
            } else {
              // This is punctuation within the word - always show as-is in gray
              charResult.push(
                <span key={`${tokenIndex}-${charIndex}`} className="inline-block text-gray-700">
                  {char}
                </span>
              );
            }
          }
          
          result.push(
            <span key={tokenIndex}>
              {charResult}
            </span>
          );
          
          targetWordIndex++;
        }
      }
    }

    return result;
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
