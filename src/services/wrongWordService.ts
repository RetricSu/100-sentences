import { WrongWordEntry } from '../types/dictation';

export class WrongWordService {
  /**
   * Detect wrong words by comparing user input with target text
   */
  static detectWrongWords(
    targetText: string,
    userInput: string,
    sentenceContext: string,
    textTitle: string
  ): WrongWordEntry[] {
    if (!targetText.trim() || !userInput.trim()) {
      return [];
    }

    const targetWords = targetText.trim().toLowerCase().split(/\s+/);
    const userWords = userInput.trim().toLowerCase().split(/\s+/);
    const wrongWords: WrongWordEntry[] = [];

    // Compare each word position
    const maxLength = Math.max(targetWords.length, userWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      const targetWord = targetWords[i] || '';
      const userWord = userWords[i] || '';
      
      // If words don't match and user actually typed something, it's a wrong word
      if (targetWord !== userWord && userWord !== '') {
        // Only add if it's not already in the list (avoid duplicates)
        const isDuplicate = wrongWords.some(w => w.word === targetWord && w.userInput === userWord);
        if (!isDuplicate) {
          wrongWords.push({
            id: '', // Will be set by the hook
            word: targetWord,
            correctSpelling: targetWord,
            userInput: userWord,
            sentenceContext,
            textTitle,
            createdAt: new Date(),
            practiceCount: 0,
          });
        }
      }
    }

    return wrongWords;
  }

  /**
   * Check if a word is wrong by comparing with target word
   */
  static isWordWrong(targetWord: string, userWord: string): boolean {
    return targetWord.toLowerCase() !== userWord.toLowerCase();
  }

  /**
   * Get the correct spelling for a word
   */
  static getCorrectSpelling(targetWord: string): string {
    return targetWord.trim();
  }
} 
