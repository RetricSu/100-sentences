import { RecitationStorage, RecitationProgressStats, RecitationValidationResult } from '../types/recitation';
import { RecitationDisplayUtils } from '../utils/recitationDisplay';
import { extractCleanWord } from '../utils/textProcessing';

/**
 * Service layer for recitation business logic
 * Encapsulates sentence ID generation, storage patterns, and validation logic
 */
export class RecitationService {
  /**
   * Generate a unique sentence ID based on content and index
   * Uses consistent hashing to ensure same sentence gets same ID
   */
  static generateSentenceId(sentenceText: string, sentenceIndex: number): string {
    const textHash = sentenceText.trim().substring(0, 50);
    return `${sentenceIndex}-${textHash}`;
  }

  /**
   * Extract clean words from text (letters only, lowercase)
   */
  static extractCleanWords(text: string): string[] {
    const words = text.toLowerCase().match(/[a-z]+/g) || [];
    return words.map(word => extractCleanWord(word));
  }

  /**
   * Check if user input matches target text completely
   */
  static checkCompletion(targetText: string, userInput: string): boolean {
    const targetWords = this.extractCleanWords(targetText);
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    return targetWords.length === userWords.length && 
           targetWords.every((word, index) => word.toLowerCase() === userWords[index]?.toLowerCase()) &&
           targetWords.length > 0;
  }

  /**
   * Get the next word position for cursor display
   */
  static getNextWordPosition(_targetText: string, userInput: string): number {
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    return userWords.length;
  }

  /**
   * Calculate completion percentage
   */
  static calculateProgress(targetText: string, userInput: string): number {
    const targetWords = this.extractCleanWords(targetText);
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    if (targetWords.length === 0) return 0;
    return Math.min((userWords.length / targetWords.length) * 100, 100);
  }

  /**
   * Validate user input against target text with enhanced word matching
   */
  static validateInput(targetText: string, userInput: string): RecitationValidationResult {
    const matchingInfo = RecitationDisplayUtils.getWordMatchingInfo(targetText, userInput);
    
    return {
      accuracy: matchingInfo.accuracy,
      isComplete: this.checkCompletion(targetText, userInput),
      correctWords: matchingInfo.correctWords,
      totalWords: matchingInfo.totalWords,
      userWords: userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0).length,
      partialWords: matchingInfo.partialWords
    };
  }

  /**
   * Calculate progress statistics for all stored inputs
   */
  static calculateProgressStats(
    sentences: string[],
    storedInputs: RecitationStorage
  ): RecitationProgressStats {
    let totalSentences = 0;
    let completedSentences = 0;
    let totalAccuracy = 0;
    let totalWords = 0;
    let totalCorrectWords = 0;
    let totalPartialWords = 0;

    sentences.forEach((sentence, index) => {
      const sentenceId = this.generateSentenceId(sentence.trim(), index);
      const userInput = storedInputs[sentenceId] || '';
      
      if (userInput.trim()) {
        totalSentences++;
        const validation = this.validateInput(sentence, userInput);
        
        if (validation.isComplete) {
          completedSentences++;
        }
        
        totalAccuracy += validation.accuracy;
        totalWords += validation.totalWords;
        totalCorrectWords += validation.correctWords;
        totalPartialWords += validation.partialWords || 0;
      }
    });

    const averageAccuracy = totalSentences > 0 ? totalAccuracy / totalSentences : 0;
    const completionRate = sentences.length > 0 ? (completedSentences / sentences.length) * 100 : 0;
    const overallAccuracy = totalWords > 0 ? (totalCorrectWords / totalWords) * 100 : 0;

    return {
      totalSentences: sentences.length,
      completedSentences,
      completionRate,
      averageAccuracy,
      overallAccuracy,
      totalWords,
      totalCorrectWords,
      totalPartialWords
    };
  }
} 
