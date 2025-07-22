import { DictationStorage, DictationProgressStats, DictationValidationResult } from '../types/dictation';
import { extractCleanWord } from '../utils/textProcessing';

/**
 * Service layer for dictation business logic
 * Encapsulates sentence ID generation, storage patterns, and validation logic
 */
export class DictationService {
  /**
   * Generate a unique sentence ID based on content and index
   * Uses consistent hashing to ensure same sentence gets same ID
   */
  static generateSentenceId(sentenceText: string, sentenceIndex: number): string {
    const textHash = sentenceText.trim().substring(0, 50);
    return `${sentenceIndex}-${textHash}`;
  }

  /**
   * Extract clean words from text (letters only, no punctuation)
   */
  static extractCleanWords(text: string): string[] {
    return text.split(/\s+/)
      .map(word => extractCleanWord(word))
      .filter(word => word.length > 0);
  }

  /**
   * Check if user input matches target text completely
   */
  static checkCompletion(targetText: string, userInput: string): boolean {
    const targetWords = this.extractCleanWords(targetText);
    const userWords = userInput.split(/\s+/).filter(word => word.length > 0);
    
    return targetWords.length === userWords.length && 
           targetWords.every((word, index) => word.toLowerCase() === userWords[index]?.toLowerCase()) &&
           targetWords.length > 0;
  }

  /**
   * Get detailed progress statistics for a sentence
   */
  static getProgressStats(targetText: string, userInput: string): DictationProgressStats {
    const targetLetters = targetText.replace(/[^a-zA-Z]/g, '');
    const userLetters = userInput.replace(/[^a-zA-Z]/g, '');
    
    let correctCharacters = 0;
    for (let i = 0; i < Math.min(targetLetters.length, userLetters.length); i++) {
      if (targetLetters[i].toLowerCase() === userLetters[i].toLowerCase()) {
        correctCharacters++;
      }
    }

    return {
      totalCharacters: targetLetters.length,
      typedCharacters: userLetters.length,
      correctCharacters,
      progressPercentage: targetLetters.length > 0 ? Math.round((correctCharacters / targetLetters.length) * 100) : 0
    };
  }

  /**
   * Validate user input against target text
   */
  static validateInput(targetText: string, userInput: string): DictationValidationResult {
    const errors: string[] = [];
    const stats = this.getProgressStats(targetText, userInput);

    // Check for invalid characters
    if (/[^a-zA-Z\s]/.test(userInput)) {
      errors.push('Input contains invalid characters. Only letters and spaces are allowed.');
    }

    // Check for excessive length
    const targetLength = targetText.replace(/[^a-zA-Z]/g, '').length;
    const userLength = userInput.replace(/[^a-zA-Z]/g, '').length;
    if (userLength > targetLength) {
      errors.push('Input is longer than the target text.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      completionPercentage: stats.progressPercentage
    };
  }

  /**
   * Check if a word is completed correctly and should auto-advance
   */
  static shouldAutoSpace(targetText: string, userInput: string): boolean {
    if (!userInput.trim() || userInput.endsWith(' ')) {
      return false;
    }

    const targetWords = this.extractCleanWords(targetText);
    const userWords = userInput.split(/\s+/).filter(word => word.length > 0);
    
    if (userWords.length === 0) return false;
    
    const currentWordIndex = userWords.length - 1;
    const currentUserWord = userWords[currentWordIndex];
    const currentTargetWord = targetWords[currentWordIndex];

    // If we've completed the current word exactly and there are more words to type
    return !!(currentTargetWord &&
              currentUserWord.toLowerCase() === currentTargetWord.toLowerCase() &&
              currentWordIndex < targetWords.length - 1);
  }

  /**
   * Get next character position for cursor display
   */
  static getNextCharacterPosition(_targetText: string, userInput: string): number {
    const userLetters = userInput.replace(/[^a-zA-Z]/g, '');
    return userLetters.length;
  }

  /**
   * Get the target letter count (excluding spaces and punctuation)
   */
  static getTargetLetterCount(targetText: string): number {
    return targetText.replace(/[^a-zA-Z]/g, '').length;
  }

  /**
   * Process storage data for bulk operations
   */
  static processBulkStorage(
    sentences: string[], 
    storageData: DictationStorage
  ): Array<{ sentenceIndex: number; sentence: string; progress: DictationProgressStats; isCompleted: boolean }> {
    return sentences.map((sentence, index) => {
      const sentenceId = this.generateSentenceId(sentence, index);
      const savedInput = storageData[sentenceId] || '';
      const progress = this.getProgressStats(sentence, savedInput);
      const isCompleted = this.checkCompletion(sentence, savedInput);

      return {
        sentenceIndex: index,
        sentence,
        progress,
        isCompleted
      };
    });
  }

  /**
   * Calculate overall completion percentage for multiple sentences
   */
  static calculateOverallProgress(
    sentences: string[], 
    storageData: DictationStorage
  ): { completedSentences: number; totalSentences: number; overallPercentage: number } {
    const processedData = this.processBulkStorage(sentences, storageData);
    const completedSentences = processedData.filter(item => item.isCompleted).length;
    const totalSentences = sentences.length;
    const overallPercentage = totalSentences > 0 ? Math.round((completedSentences / totalSentences) * 100) : 0;

    return {
      completedSentences,
      totalSentences,
      overallPercentage
    };
  }
} 
