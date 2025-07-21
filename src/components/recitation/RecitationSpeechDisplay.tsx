import React from "react";
import { useRecitationContext } from "../../contexts/RecitationContext";
import { useSpeechContext } from "../../contexts/SpeechContext";
import { RecitationDisplayUtils } from "../../utils/recitationDisplay";

export const RecitationSpeechDisplay: React.FC = () => {
  const recitation = useRecitationContext();
  const speech = useSpeechContext();

  // Get current active input for the current sentence
  const currentSentenceIndex = recitation.currentSentenceIndex;
  const currentSentence = currentSentenceIndex !== null ? speech.sentences[currentSentenceIndex] : null;
  
  let currentInput = "";
  if (currentSentence && currentSentenceIndex !== null) {
    const sentenceId = RecitationDisplayUtils.generateSentenceId(currentSentence.trim(), currentSentenceIndex);
    currentInput = recitation.activeInputs[sentenceId] || "";
  }

  if (!recitation.isListening && !currentInput) {
    return null;
  }

  return (
    <div className="fixed bottom-32 right-6 z-40 max-w-sm">
      <div className="bg-white rounded-lg p-4 shadow-lg border">
        <div className="text-sm text-gray-600 mb-2">
          {recitation.isListening ? "Listening..." : "Your speech:"}
        </div>
        <div className="text-gray-800 font-medium break-words">
          {currentInput || "Start speaking..."}
        </div>
        {recitation.isListening && (
          <div className="mt-2 flex items-center gap-2">
            <div className="animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            <span className="text-xs text-red-600">Recording</span>
          </div>
        )}
      </div>
    </div>
  );
}; 
