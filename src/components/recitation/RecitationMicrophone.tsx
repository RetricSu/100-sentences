import React, { useEffect } from "react";
import { useRecitationContext } from "../../contexts/RecitationContext";

export const RecitationMicrophone: React.FC = () => {
  const recitation = useRecitationContext();

  const handleMicrophoneClick = () => {
    if (recitation.isListening) {
      recitation.stopListening();
    } else {
      recitation.startListening();
    }
  };

  // Add keyboard support for 'R' key (for Recitation)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger on 'R' key and when not typing in an input field
      const target = event.target as HTMLElement;
      const isInputField = 
        target?.tagName === 'INPUT' || 
        target?.tagName === 'TEXTAREA' || 
        target?.contentEditable === 'true';
      
      if ((event.code === 'KeyR' || event.key === 'r' || event.key === 'R') && !isInputField && recitation.isActive) {
        event.preventDefault();
        event.stopPropagation();
        handleMicrophoneClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [recitation.isListening, recitation.isActive]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-center gap-3">
        {/* Microphone button */}
        <button
          onClick={handleMicrophoneClick}
          className={`p-6 rounded-full transition-all duration-200 shadow-lg ${
            recitation.isListening 
              ? 'bg-red-500 text-white scale-110 shadow-xl' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
          }`}
          title={recitation.isListening ? "Stop listening (R)" : "Start listening (R)"}
        >
          {recitation.isListening ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Status indicator */}
        {recitation.isListening && (
          <div className="bg-white rounded-lg px-4 py-2 shadow-lg border">
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <div className="animate-pulse">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              </div>
              <span className="text-sm">Listening...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
