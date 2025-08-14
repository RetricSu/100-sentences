import { stripHtml } from 'string-strip-html';

/**
 * Remove zero-width characters and other invisible characters from a string
 */
export const removeZeroWidthChars = (str: string): string => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  
  return str.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F]/g, '').trim();
};

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
 * Extract clean word from text (removes punctuation and zero-width characters)
 * This is a utility function that can be reused
 */
export const extractCleanWord = (text: string): string => {
  // First strip any HTML if present
  const strippedText = stripHtml(text).result;
  
  // Remove punctuation and normalize
  const cleaned = removePunctuation(strippedText)
    .trim()
    .toLowerCase();
  
  // Remove zero-width characters and other invisible characters
  const withoutZeroWidth = removeZeroWidthChars(cleaned);
  
  // Only return if it contains letters
  return /[a-zA-Z]/.test(withoutZeroWidth) ? withoutZeroWidth : '';
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
