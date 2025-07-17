import React, { useState, useEffect, useRef } from "react";

interface DictationInputProps {
  targetText: string;
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}

export const DictationInput: React.FC<DictationInputProps> = ({
  targetText,
  isVisible,
  onComplete,
  className = "",
}) => {
  const [userInput, setUserInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when target text changes or visibility changes
  useEffect(() => {
    if (isVisible) {
      setUserInput("");
      setIsCompleted(false);
      // Focus the input when it becomes visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [targetText, isVisible]);

  // Check if completed
  useEffect(() => {
    if (userInput === targetText && targetText.length > 0) {
      setIsCompleted(true);
      onComplete?.();
    } else {
      setIsCompleted(false);
    }
  }, [userInput, targetText, onComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow any input but validate character by character
    if (value.length <= targetText.length) {
      setUserInput(value);
    }
  };

  // Auto-complete spaces when word is finished
  useEffect(() => {
    if (!targetText || !userInput) return;

    const targetWords = targetText.split(/(\s+)/);
    const userWords = userInput.split(/(\s+)/);

    // If we've completed a word and the next character should be a space
    if (userWords.length > 0 && userWords.length < targetWords.length) {
      const currentWordIndex = userWords.length - 1;
      const targetWord = targetWords[currentWordIndex];
      const userWord = userWords[currentWordIndex];

      // If we've completed the current word exactly
      if (
        userWord === targetWord &&
        targetWords[currentWordIndex + 1]?.trim() === ""
      ) {
        // Auto-add the space
        setUserInput(userInput + " ");
      }
    }
  }, [userInput, targetText]);

  const handleKeyDown = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow all keys for typing
    return;
  };

  // Generate display text with colored characters
  const generateDisplayText = () => {
    if (!targetText) return "";

    // Split target text into words to handle word-by-word navigation
    const words = targetText.split(/(\s+)/); // Split by spaces but keep spaces
    const userWords = userInput.split(/(\s+)/);

    let result = [];
    let charIndex = 0;

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const targetWord = words[wordIndex];
      const userWord = userWords[wordIndex] || "";

      if (targetWord.trim() === "") {
        // This is a space character
        if (wordIndex < userWords.length) {
          // Space has been typed correctly
          result.push(
            <span key={charIndex} className="inline-block text-green-600">
              {"\u00A0"}
            </span>
          );
        } else {
          // Space not yet typed
          result.push(
            <span key={charIndex} className="inline-block text-gray-400">
              {"\u00A0"}
            </span>
          );
        }
        charIndex += targetWord.length;
      } else {
        // This is a word
        const wordChars = targetWord.split("");
        const userWordChars = userWord.split("");

        for (let i = 0; i < wordChars.length; i++) {
          const char = wordChars[i];
          const userChar = userWordChars[i];

          let className = "inline-block";

          if (i < userWordChars.length) {
            // Character has been typed
            if (userChar === char) {
              className += " text-green-600"; // Correct
            } else {
              className += " text-red-600"; // Wrong
            }
          } else if (
            i === userWordChars.length &&
            wordIndex === userWords.length - 1
          ) {
            // Current character to type (only for the current word)
            className += " text-gray-800 bg-blue-100 animate-pulse";
          } else {
            // Not yet typed - show as underscore
            className += " text-gray-400";
          }

          result.push(
            <span key={charIndex + i} className={className}>
              {i < userWordChars.length
                ? userChar === char
                  ? char
                  : userChar
                : "_"}
            </span>
          );
        }
        charIndex += wordChars.length;
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
    </div>
  );
};
