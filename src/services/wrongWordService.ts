import { WrongWordEntry } from '../types/dictation';

export class WrongWordService {
  /**
   * Detect wrong words by comparing user input with target text
   * Uses the same logic as the visual display - red color indicates wrong characters
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

    const userLetters = userInput.replace(/\s+/g, '');
    const tokens = targetText.split(/(\s+)/);
    let globalLetterIndex = 0;
    const wrongWords: WrongWordEntry[] = [];
    const currentWordChars: string[] = [];
    const currentUserChars: string[] = [];

    // Process each token (word or space)
    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      const token = tokens[tokenIndex];
      
      if (token.trim() === '') {
        // Space - process accumulated word if any
        if (currentWordChars.length > 0) {
          this.processAccumulatedWord(
            currentWordChars.join(''),
            currentUserChars.join(''),
            sentenceContext,
            textTitle,
            wrongWords
          );
          currentWordChars.length = 0;
          currentUserChars.length = 0;
        }
      } else {
        // Word with letters
        const cleanWord = this.extractCleanWord(token);
        if (cleanWord.length === 0) {
          // Pure punctuation - skip
          continue;
        } else {
          // Process each character in the word
          for (const char of token) {
            if (/[a-zA-Z]/.test(char)) {
              const userChar = userLetters[globalLetterIndex];
              
              if (globalLetterIndex < userLetters.length && userChar) {
                // Character has been typed - check if it's correct
                const isCorrect = userChar.toLowerCase() === char.toLowerCase();
                
                if (!isCorrect) {
                  // This character is wrong (would be red in display)
                  currentWordChars.push(char);
                  currentUserChars.push(userChar);
                }
              }
              globalLetterIndex++;
            } else {
              // Punctuation within word
              currentWordChars.push(char);
            }
          }
          
          // Process the word if it has wrong characters
          if (currentWordChars.length > 0) {
            this.processAccumulatedWord(
              currentWordChars.join(''),
              currentUserChars.join(''),
              sentenceContext,
              textTitle,
              wrongWords
            );
            currentWordChars.length = 0;
            currentUserChars.length = 0;
          }
        }
      }
    }

    return wrongWords;
  }

  /**
   * Extract clean word (letters only) for comparison
   */
  private static extractCleanWord(word: string): string {
    return word.replace(/[^a-zA-Z]/g, '');
  }

  /**
   * Process accumulated word and add to wrong words if it contains wrong characters
   */
  private static processAccumulatedWord(
    targetWord: string,
    userWord: string,
    sentenceContext: string,
    textTitle: string,
    wrongWords: WrongWordEntry[]
  ): void {
    if (userWord.length === 0) return;

    // Check if this word contains any wrong characters
    const targetLetters = targetWord.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const userLetters = userWord.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    if (targetLetters !== userLetters) {
      // Only add if it's not already in the list (avoid duplicates)
      const isDuplicate = wrongWords.some(w => 
        w.word === targetWord && w.userInput === userWord
      );
      
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
