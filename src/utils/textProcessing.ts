/**
 * Extract clean word from text (removes punctuation)
 * This is a utility function that can be reused
 */
export const extractCleanWord = (text: string): string => {
  return text.replace(/[^A-Za-z']/g, "");
};

/**
 * Check if a sentence should be highlighted based on current state
 */
export const shouldHighlightSentence = (
  sentenceIndex: number,
  currentSentenceIndex: number,
  isSpeaking: boolean
): boolean => {
  return sentenceIndex === currentSentenceIndex && (isSpeaking || currentSentenceIndex > 0);
}; 
