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
  const [isListeningLocal, setIsListeningLocal] = useState(false);
  
  const { saveRecitationInput, isLoaded } = useRecitationStorage();
  const recitation = useRecitationContext();

  // Get the current input from context
  const sentenceId = useMemo(() => 
    RecitationDisplayUtils.generateSentenceId(targetText.trim(), sentenceIndex), 
    [targetText, sentenceIndex]
  );
  const userInput = recitation.activeInputs[sentenceId] || initialInput;
  
  // Debug logging
  console.log('RecitationInput render:', { 
    sentenceId, 
    userInput, 
    activeInputs: recitation.activeInputs,
    isListening: recitation.isListening 
  });

  // Check completion and save to storage when userInput changes
  useEffect(() => {
    if (!isLoaded || !userInput) return;
    
    // Check completion immediately for responsive UI
    const isCompleted = RecitationService.checkCompletion(targetText, userInput);
    if (isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    } else {
      setIsCompleted(false);
    }
    
    // Save to storage
    saveRecitationInput(targetText, sentenceIndex, userInput);
  }, [targetText, sentenceIndex, saveRecitationInput, isLoaded, userInput, onComplete]);

  // Sync listening state
  useEffect(() => {
    setIsListeningLocal(recitation.isListening);
  }, [recitation.isListening]);

  // Handle microphone button click
  const handleMicrophoneClick = () => {
    if (isListeningLocal) {
      recitation.stopListening();
    } else {
      recitation.startListening();
    }
  };

  // Generate display text with word-by-word progression
  const generateDisplayText = () => {
    if (!targetText) return "";

    const nextWordPosition = RecitationService.getNextWordPosition(targetText, userInput);
    return RecitationDisplayUtils.generateMaskedDisplay(targetText, userInput, {
      showCursor: true,
      cursorPosition: nextWordPosition
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`recitation-input-container ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent any clicks from bubbling up
    >
      {/* Microphone button */}
      <div className="flex items-center justify-center mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            handleMicrophoneClick();
          }}
          className={`p-4 rounded-full transition-all duration-200 ${
            isListeningLocal 
              ? 'bg-red-500 text-white shadow-lg scale-110' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
          }`}
          title={isListeningLocal ? "Stop listening" : "Start listening"}
        >
          {isListeningLocal ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Visual display that shows speech input */}
      <div className="font-mono text-lg leading-relaxed tracking-wider relative">
        {generateDisplayText()}
      </div>

      {/* Status indicator */}
      <div className="mt-4 text-center">
        {isListeningLocal ? (
          <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
            <div className="animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            <span>Listening... Speak now!</span>
          </div>
        ) : (
          <div className="text-gray-600 text-sm">
            Click the microphone to start speaking
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {isCompleted && (
        <div className="mt-2 text-sm text-green-600 font-medium text-center">
          ✓ Completed!
        </div>
      )}

      {/* User input display */}
      {userInput && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Your speech:</div>
          <div className="text-gray-800 font-medium">{userInput}</div>
        </div>
      )}
    </div>
  );
}; 
