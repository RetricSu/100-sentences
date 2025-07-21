import React, { useState, useEffect } from 'react';
import { useWrongWordBook } from '../../hooks/useWrongWordBook';
import { useDictationStorage } from '../../hooks/useDictationStorage';
import { useSpeechContext } from '../../contexts/SpeechContext';
import { WrongWordService } from '../../services/wrongWordService';

export const WrongWordSaveButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const wrongWordBook = useWrongWordBook();
  const dictationStorage = useDictationStorage();
  const speech = useSpeechContext();

  // Check if there are any dictation inputs to save
  useEffect(() => {
    if (!dictationStorage.isLoaded || !wrongWordBook.isLoaded) return;
    
    const allInputs = dictationStorage.getAllDictationInputs();
    const hasInputs = Object.keys(allInputs).length > 0;
    setShowButton(hasInputs);
  }, [dictationStorage.isLoaded, wrongWordBook.isLoaded, dictationStorage.getAllDictationInputs]);

  const handleSaveAllWrongWords = async () => {
    if (!speech.originalText.trim()) return;
    
    setIsSaving(true);
    
    try {
      const allInputs = dictationStorage.getAllDictationInputs();
      const textTitle = speech.originalText.trim().substring(0, 50) + (speech.originalText.length > 50 ? '...' : '');
      
      let addedCount = 0;
      let skippedCount = 0;
      
      // Process each sentence that has input
      Object.entries(allInputs).forEach(([sentenceId, userInput]) => {
        if (!userInput.trim()) return;
        
        // Extract sentence index from sentenceId (format: "index-textHash")
        const sentenceIndex = parseInt(sentenceId.split('-')[0]);
        const targetSentence = speech.sentences[sentenceIndex];
        
        if (!targetSentence) return;
        
        // Detect wrong words for this sentence
        const wrongWords = WrongWordService.detectWrongWords(
          targetSentence,
          userInput,
          targetSentence,
          textTitle
        );
        
        // Add each wrong word to the book
        wrongWords.forEach(wrongWord => {
          // Check if this word is already in the book
          if (wrongWordBook.isDuplicateWord(wrongWord.word)) {
            skippedCount++;
          } else {
            wrongWordBook.addWrongWord(wrongWord);
            addedCount++;
          }
        });
      });
      
      // Show success message with details
      let message = '';
      if (addedCount > 0 && skippedCount > 0) {
        message = `Added ${addedCount} new wrong words to your book. Skipped ${skippedCount} duplicates.`;
      } else if (addedCount > 0) {
        message = `Added ${addedCount} wrong words to your book!`;
      } else if (skippedCount > 0) {
        message = `All ${skippedCount} wrong words were already in your book.`;
      } else {
        message = 'No wrong words to save.';
      }
      
      alert(message);
      
    } catch (error) {
      console.error('Error saving wrong words:', error);
      alert('Error saving wrong words. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleSaveAllWrongWords}
        disabled={isSaving}
        className="px-6 py-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        title="Save all wrong words from current dictation session"
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Save Wrong Words</span>
          </>
        )}
      </button>
    </div>
  );
}; 
