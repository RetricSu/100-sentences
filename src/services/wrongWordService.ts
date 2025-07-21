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
    let currentWord = '';
    let currentWordHasWrongChar = false;

    // Process each token (word or space)
    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      const token = tokens[tokenIndex];
      
      if (token.trim() === '') {
        // Space - process accumulated word if it has wrong characters
        if (currentWord && currentWordHasWrongChar) {
          this.processWrongWord(
            currentWord,
            sentenceContext,
            textTitle,
            wrongWords
          );
        }
        currentWord = '';
        currentWordHasWrongChar = false;
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
                  // This character is wrong - mark the whole word as having wrong characters
                  currentWordHasWrongChar = true;
                }
              }
              globalLetterIndex++;
            }
            // Always add the character to the current word (both correct and wrong chars)
            currentWord += char;
          }
          
          // Process the word if it has wrong characters
          if (currentWord && currentWordHasWrongChar) {
            this.processWrongWord(
              currentWord,
              sentenceContext,
              textTitle,
              wrongWords
            );
          }
          currentWord = '';
          currentWordHasWrongChar = false;
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
   * Process wrong word and add to wrong words list
   */
  private static processWrongWord(
    targetWord: string,
    sentenceContext: string,
    textTitle: string,
    wrongWords: WrongWordEntry[]
  ): void {
    if (!targetWord.trim()) return;

    // Check if this word already exists in the wrong words list
    const existingWordIndex = wrongWords.findIndex(w => 
      w.word.toLowerCase().trim() === targetWord.toLowerCase().trim()
    );

    if (existingWordIndex >= 0) {
      // Word already exists, add context if it's not already there
      const existingEntry = wrongWords[existingWordIndex];
      if (!existingEntry.sentenceContext.includes(sentenceContext)) {
        existingEntry.sentenceContext.push(sentenceContext);
      }
    } else {
      // New word, create new entry
      wrongWords.push({
        id: '', // Will be set by the hook
        word: targetWord,
        sentenceContext: [sentenceContext],
        textTitle,
        createdAt: new Date(),
        practiceCount: 0,
      });
    }
  }

  /**
   * Check if a word is wrong by comparing with target word
   */
  static isWordWrong(targetWord: string, userWord: string): boolean {
    return targetWord.toLowerCase() !== userWord.toLowerCase();
  }
} 
