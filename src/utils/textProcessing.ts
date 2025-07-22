import { stripHtml } from 'string-strip-html';

/**
 * Remove punctuation from a string
 */
export const removePunctuation = (str: string): string => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  
  // Remove punctuation but preserve apostrophes for contractions
  return str.replace(/[&\/\\#,+\(\)$~%\.!^";:*?\[\]<>{}`@]/g, '');
};

/**
 * Extract clean word from text (removes punctuation)
 * This is a utility function that can be reused
 */
export const extractCleanWord = (text: string): string => {
  // First strip any HTML if present
  const strippedText = stripHtml(text).result;
  
  // Remove punctuation and normalize
  const cleaned = removePunctuation(strippedText)
    .trim()
    .toLowerCase();
  
  // Only return if it contains letters
  return /[a-zA-Z]/.test(cleaned) ? cleaned : '';
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
