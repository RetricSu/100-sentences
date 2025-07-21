import React from 'react';

interface CharacterDisplayOptions {
  showCursor?: boolean;
  cursorPosition?: number;
}

interface WordMatch {
  targetWord: string;
  userWord: string;
  isCorrect: boolean;
  isPartial: boolean;
  similarity: number;
}

export class RecitationDisplayUtils {
  /**
   * Generate a unique sentence ID based on content and index
   */
  static generateSentenceId(sentenceText: string, sentenceIndex: number): string {
    const textHash = sentenceText.trim().substring(0, 50);
    return `${sentenceIndex}-${textHash}`;
  }

  /**
   * Extract clean words from text (letters and spaces only)
   */
  static extractCleanWords(text: string): string[] {
    return text.toLowerCase().match(/[a-z]+/g) || [];
  }

  /**
   * Extract clean word from a token (removing punctuation)
   */
  static extractCleanWord(token: string): string {
    return token.toLowerCase().replace(/[^a-z]/g, '');
  }

  /**
   * Calculate similarity between two words using Levenshtein distance
   */
  static calculateWordSimilarity(word1: string, word2: string): number {
    const len1 = word1.length;
    const len2 = word2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = word1[i - 1] === word2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Match user words to target words with fuzzy matching
   */
  static matchWords(targetWords: string[], userWords: string[]): WordMatch[] {
    const matches: WordMatch[] = [];
    
    for (let i = 0; i < targetWords.length; i++) {
      const targetWord = targetWords[i];
      const userWord = userWords[i] || '';
      
      if (!userWord) {
        matches.push({
          targetWord,
          userWord: '',
          isCorrect: false,
          isPartial: false,
          similarity: 0
        });
        continue;
      }
      
      const similarity = this.calculateWordSimilarity(targetWord, userWord);
      const isCorrect = similarity === 1;
      const isPartial = similarity >= 0.7 && !isCorrect;
      
      matches.push({
        targetWord,
        userWord,
        isCorrect,
        isPartial,
        similarity
      });
    }
    
    return matches;
  }

  /**
   * Generate enhanced masked display for recitation mode
   * Shows user's speech input compared to target text with better word-level matching
   */
  static generateMaskedDisplay(
    targetText: string,
    userInput: string = '',
    options: CharacterDisplayOptions = {}
  ): React.ReactNode[] {
    const { showCursor = false, cursorPosition } = options;
    const targetWords = this.extractCleanWords(targetText);
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const wordMatches = this.matchWords(targetWords, userWords);
    
    const tokens = targetText.split(/(\s+)/);
    let globalWordIndex = 0;
    const result: React.ReactNode[] = [];

    tokens.forEach((token, tokenIndex) => {
      if (token.trim() === '') {
        // Handle spaces
        result.push(<span key={`space-${tokenIndex}`}>&nbsp;</span>);
      } else {
        // Word with letters
        const cleanWord = this.extractCleanWord(token);
        if (cleanWord.length === 0) {
          // Punctuation only
          result.push(
            <span key={`punct-${tokenIndex}`} className="text-gray-700">
              {token}
            </span>
          );
        } else {
          // Word with letters
          const match = wordMatches[globalWordIndex];
          const isCurrentPosition = showCursor && globalWordIndex === cursorPosition;
          const hasUserInput = match && match.userWord;
          
          if (hasUserInput) {
            // Word has been spoken - show overlay
            const overlayClass = match.isCorrect 
              ? 'text-green-700 font-semibold bg-green-50 border-green-200' 
              : match.isPartial 
                ? 'text-yellow-700 font-medium bg-yellow-50 border-yellow-200' 
                : 'text-red-700 font-medium bg-red-50 border-red-200';
            
            result.push(
              <span key={`word-${tokenIndex}`} className="inline-block relative group mx-0.5">
                {/* Background text (target) */}
                <span className="text-gray-300 select-none">{token}</span>
                
                {/* Overlay text (user input) */}
                <span className={`absolute inset-0 flex items-center justify-center ${overlayClass} border rounded-md shadow-sm px-1 py-0.5 transition-all duration-200 hover:shadow-md min-w-full`}>
                  {match.userWord}
                </span>
                
                {/* Tooltip for similarity */}
                {!match.isCorrect && (
                  <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg whitespace-nowrap">
                    {Math.round(match.similarity * 100)}% match
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </span>
                )}
              </span>
            );
          } else if (isCurrentPosition) {
            // Current word position
            result.push(
              <span key={`word-${tokenIndex}`} className="inline-block text-gray-800 bg-emerald-200 border-2 border-emerald-400 rounded-md px-1 py-0.5 animate-pulse shadow-sm mx-0.5">
                {token}
              </span>
            );
          } else {
            // Future word
            result.push(
              <span key={`word-${tokenIndex}`} className="inline-block text-gray-400 mx-0.5">
                {token}
              </span>
            );
          }
          globalWordIndex++;
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
    const targetWords = this.extractCleanWords(targetText);
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const wordMatches = this.matchWords(targetWords, userWords);
    
    const tokens = targetText.split(/(\s+)/);
    let globalWordIndex = 0;
    let result = '';

    for (const token of tokens) {
      if (token.trim() === '') {
        result += '&nbsp;';
      } else {
        const cleanWord = this.extractCleanWord(token);
        if (cleanWord.length === 0) {
          result += `<span class="text-gray-700">${token}</span>`;
        } else {
          const match = wordMatches[globalWordIndex];
          const isCurrentPosition = showCursor && globalWordIndex === cursorPosition;
          const hasUserInput = match && match.userWord;
          
          if (hasUserInput) {
            const overlayClass = match.isCorrect 
              ? 'text-green-700 font-semibold bg-green-50 border-green-200' 
              : match.isPartial 
                ? 'text-yellow-700 font-medium bg-yellow-50 border-yellow-200' 
                : 'text-red-700 font-medium bg-red-50 border-red-200';
            
            result += `<span class="inline-block relative mx-0.5">
              <span class="text-gray-300 select-none">${token}</span>
              <span class="absolute inset-0 flex items-center justify-center ${overlayClass} border rounded-md shadow-sm px-1 py-0.5 min-w-full">${match.userWord}</span>
            </span>`;
          } else if (isCurrentPosition) {
            result += `<span class="inline-block text-gray-800 bg-emerald-200 border-2 border-emerald-400 rounded-md px-1 py-0.5 animate-pulse shadow-sm mx-0.5">${token}</span>`;
          } else {
            result += `<span class="inline-block text-gray-400 mx-0.5">${token}</span>`;
          }
          globalWordIndex++;
        }
      }
    }

    return result;
  }

  /**
   * Get detailed word matching information
   */
  static getWordMatchingInfo(targetText: string, userInput: string): {
    matches: WordMatch[];
    accuracy: number;
    correctWords: number;
    partialWords: number;
    totalWords: number;
  } {
    const targetWords = this.extractCleanWords(targetText);
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const matches = this.matchWords(targetWords, userWords);
    
    const correctWords = matches.filter(m => m.isCorrect).length;
    const partialWords = matches.filter(m => m.isPartial).length;
    const totalWords = targetWords.length;
    const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
    
    return {
      matches,
      accuracy,
      correctWords,
      partialWords,
      totalWords
    };
  }
} 
