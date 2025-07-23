import React from "react";
import { CharacterDisplayOptions, DictationProgressStats } from "../types/dictation";
import { DictationService } from "../services/dictationService";
import { extractCleanWord } from "./textProcessing";

/**
 * Shared utility for dictation display logic
 * Consolidates character rendering logic used across multiple components
 */
export class DictationDisplayUtils {
  /**
   * Extract all clean words from text
   */
  static extractCleanWords(text: string): string[] {
    return DictationService.extractCleanWords(text);
  }

  /**
   * Generate sentence ID for storage (matching useDictationStorage logic)
   */
  static generateSentenceId(sentenceText: string, sentenceIndex: number): string {
    return DictationService.generateSentenceId(sentenceText, sentenceIndex);
  }

  /**
   * Generate masked text display for React components
   */
  static generateMaskedDisplay(
    targetText: string,
    userInput: string = '',
    options: CharacterDisplayOptions = {}
  ): React.ReactNode[] {
    const { showCursor = false, cursorPosition } = options;
    const userLetters = userInput.replace(/\s+/g, '');
    const tokens = targetText.split(/(\s+)/);
    let globalLetterIndex = 0;
    const result: React.ReactNode[] = [];

    tokens.forEach((token, tokenIndex) => {
      if (token.trim() === '') {
        // Whitespace
        result.push(
          <span key={tokenIndex} className="inline-block">
            {'\u00A0'}
          </span>
        );
      } else {
        const cleanWord = extractCleanWord(token);
        if (cleanWord.length === 0) {
          // Pure punctuation
          result.push(
            <span key={tokenIndex} className="inline-block text-gray-700">
              {token}
            </span>
          );
        } else {
          // Word with letters
          const charResults: React.ReactNode[] = [];
          Array.from(token).forEach((char, charIndex) => {
            if (/[a-zA-Z]/.test(char)) {
              const userChar = userLetters[globalLetterIndex];
              const isCurrentPosition = showCursor && globalLetterIndex === cursorPosition;
              
              if (isCurrentPosition && globalLetterIndex < userLetters.length) {
                // Current cursor position over a typed character - show character with cursor overlay
                const isCorrect = userChar && userChar.toLowerCase() === char.toLowerCase();
                charResults.push(
                  <span key={`${tokenIndex}-${charIndex}`} className="inline-block relative min-w-[1ch]">
                    <span className="text-gray-200 select-none">_</span>
                    <span className={`absolute inset-0 flex items-center justify-center ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {userChar}
                    </span>
                    <span className="absolute inset-0 bg-gray-400 animate-pulse opacity-50"></span>
                  </span>
                );
              } else if (isCurrentPosition) {
                // Current cursor position over future character - show cursor
                charResults.push(
                  <span key={`${tokenIndex}-${charIndex}`} className="inline-block min-w-[1ch] text-gray-800 bg-gray-400 animate-pulse opacity-50">
                    _
                  </span>
                );
              } else if (globalLetterIndex < userLetters.length) {
                // Character has been typed
                const isCorrect = userChar && userChar.toLowerCase() === char.toLowerCase();
                charResults.push(
                  <span key={`${tokenIndex}-${charIndex}`} className="inline-block relative min-w-[1ch]">
                    <span className="text-gray-200 select-none">_</span>
                    <span className={`absolute inset-0 flex items-center justify-center ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium`}>
                      {userChar}
                    </span>
                  </span>
                );
              } else {
                // Future character
                charResults.push(
                  <span key={`${tokenIndex}-${charIndex}`} className="inline-block min-w-[1ch] text-gray-400">
                    _
                  </span>
                );
              }
              globalLetterIndex++;
            } else {
              // Punctuation within word
              charResults.push(
                <span key={`${tokenIndex}-${charIndex}`} className="inline-block text-gray-700">
                  {char}
                </span>
              );
            }
          });
          
          result.push(
            <span key={tokenIndex}>
              {charResults}
            </span>
          );
        }
      }
    });

    return result;
  }

  /**
   * Generate masked text display as HTML string (for backward compatibility)
   */
  static generateMaskedHTML(
    targetText: string,
    userInput: string = '',
    options: CharacterDisplayOptions = {}
  ): string {
    const { showCursor = false, cursorPosition } = options;
    const userLetters = userInput.replace(/\s+/g, '');
    const tokens = targetText.split(/(\s+)/);
    let globalLetterIndex = 0;
    let result = '';

    for (const token of tokens) {
      if (token.trim() === '') {
        result += '&nbsp;';
      } else {
        const cleanWord = extractCleanWord(token);
        if (cleanWord.length === 0) {
          result += `<span class="text-gray-700">${token}</span>`;
        } else {
          for (const char of token) {
            if (/[a-zA-Z]/.test(char)) {
              const userChar = userLetters[globalLetterIndex];
              const isCurrentPosition = showCursor && globalLetterIndex === cursorPosition;
              
              if (isCurrentPosition && globalLetterIndex < userLetters.length && userChar) {
                const isCorrect = userChar.toLowerCase() === char.toLowerCase();
                result += `<span class="inline-block relative min-w-[1ch]">
                  <span class="text-gray-200 select-none">_</span>
                  <span class="absolute inset-0 flex items-center justify-center ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium">${userChar}</span>
                  <span class="absolute inset-0 bg-gray-400 animate-pulse opacity-50"></span>
                </span>`;
              } else if (isCurrentPosition) {
                result += `<span class="inline-block min-w-[1ch] text-gray-800 bg-gray-400 animate-pulse opacity-50">_</span>`;
              } else if (globalLetterIndex < userLetters.length && userChar) {
                const isCorrect = userChar.toLowerCase() === char.toLowerCase();
                result += `<span class="inline-block relative min-w-[1ch]">
                  <span class="text-gray-200 select-none">_</span>
                  <span class="absolute inset-0 flex items-center justify-center ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium">${userChar}</span>
                </span>`;
              } else {
                result += `<span class="inline-block min-w-[1ch] text-gray-400">_</span>`;
              }
              globalLetterIndex++;
            } else {
              result += `<span class="text-gray-700">${char}</span>`;
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Check if user input matches target text (for completion detection)
   */
  static checkCompletion(targetText: string, userInput: string): boolean {
    return DictationService.checkCompletion(targetText, userInput);
  }

  /**
   * Get progress statistics for a sentence
   */
  static getProgressStats(targetText: string, userInput: string): DictationProgressStats {
    return DictationService.getProgressStats(targetText, userInput);
  }
} 
