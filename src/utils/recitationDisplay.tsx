import React from 'react';

interface CharacterDisplayOptions {
  showCursor?: boolean;
  cursorPosition?: number;
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
   * Generate masked display for recitation mode
   * Shows user's speech input compared to target text
   */
  static generateMaskedDisplay(
    targetText: string,
    userInput: string = '',
    options: CharacterDisplayOptions = {}
  ): React.ReactNode[] {
    const { showCursor = false, cursorPosition } = options;
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
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
          const userWord = userWords[globalWordIndex];
          const isCurrentPosition = showCursor && globalWordIndex === cursorPosition;
          
          if (userWord) {
            // Word has been spoken
            const isCorrect = userWord.toLowerCase() === cleanWord.toLowerCase();
            result.push(
              <span key={`word-${tokenIndex}`} className="inline-block relative">
                <span className="text-gray-200 select-none">{token}</span>
                <span className={`absolute inset-0 flex items-center justify-center ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {userWord}
                </span>
              </span>
            );
          } else if (isCurrentPosition) {
            // Current word position
            result.push(
              <span key={`word-${tokenIndex}`} className="inline-block text-gray-800 bg-emerald-100 animate-pulse">
                {token}
              </span>
            );
          } else {
            // Future word
            result.push(
              <span key={`word-${tokenIndex}`} className="inline-block text-gray-400">
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
    const userWords = userInput.toLowerCase().split(/\s+/).filter(word => word.length > 0);
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
          const userWord = userWords[globalWordIndex];
          const isCurrentPosition = showCursor && globalWordIndex === cursorPosition;
          
          if (userWord) {
            const isCorrect = userWord.toLowerCase() === cleanWord.toLowerCase();
            result += `<span class="inline-block relative">
              <span class="text-gray-200 select-none">${token}</span>
              <span class="absolute inset-0 flex items-center justify-center ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium">${userWord}</span>
            </span>`;
          } else if (isCurrentPosition) {
            result += `<span class="inline-block text-gray-800 bg-emerald-100 animate-pulse">${token}</span>`;
          } else {
            result += `<span class="inline-block text-gray-400">${token}</span>`;
          }
          globalWordIndex++;
        }
      }
    }

    return result;
  }
} 
