import { ProcessedTextOptions, DictationProcessingOptions } from '../types/dictation';

export class TextProcessor {
  /**
   * Process text into clickable words with sentence highlighting and paragraph spacing
   */
  static processTextToHTML(text: string, options: ProcessedTextOptions): string {
    if (!text.trim()) return "";

    const { currentSentenceIndex, isSpeaking } = options;
    
    // Process all sentences using the same logic as the speech hook
    const allSentences = this.processSentences(text);

    // Create a mapping of sentence text to global index
    const sentenceToIndexMap = new Map<string, number>();
    allSentences.forEach((sentence, index) => {
      sentenceToIndexMap.set(sentence.trim(), index);
    });

    // Split into paragraphs for visual layout
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0);

    return paragraphs
      .map((paragraph, paragraphIndex) => {
        // Split each paragraph into sentences using the same logic
        const paragraphSentences = this.processSentences(paragraph);

        const processedSentences = paragraphSentences
          .map((sentence) => {
            const words = sentence.trim().split(/\s+/);
            const processedWords = words
              .map(
                (word) =>
                  `<span class="word cursor-pointer px-1 py-1 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 hover:shadow-sm">${word}</span>`
              )
              .join(" ");

            // Get the global index for this sentence
            const globalIndex = sentenceToIndexMap.get(sentence.trim()) || 0;

            // Highlight current sentence when speaking or when explicitly selected
            const isCurrentSentence = globalIndex === currentSentenceIndex;
            const shouldHighlight = isCurrentSentence && (isSpeaking || currentSentenceIndex > 0);
            
            const sentenceClass = shouldHighlight
              ? "current-sentence bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-2 my-2 rounded-r-lg shadow-sm"
              : "sentence py-1 my-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors";

            return `<div class="${sentenceClass}" data-sentence-index="${globalIndex}">${processedWords}</div>`;
          })
          .join("");

        // Wrap each paragraph with spacing
        const paragraphClass =
          paragraphIndex === 0
            ? "paragraph-block mb-8 first:mb-8"
            : "paragraph-block mb-8 pt-4 border-t border-gray-100";

        return `<div class="${paragraphClass}">${processedSentences}</div>`;
      })
      .join("");
  }

  /**
   * Process text into sentences - same logic as speech hook
   */
  static processSentences(text: string): string[] {
    if (!text.trim()) return [];

    const rawSentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    return rawSentences
      .map((sentence) => {
        const trimmed = sentence.trim();
        if (trimmed && !trimmed.match(/[.!?]$/)) {
          return trimmed + ".";
        }
        return trimmed;
      })
      .filter((s) => s.length > 0);
  }

  /**
   * Generate masked text for dictation mode - letters become underscores, punctuation remains visible
   */
  static generateMaskedText(text: string): string {
    return text.replace(/[a-zA-Z]/g, '_');
  }

  /**
   * Process text into masked HTML for dictation mode
   */
  static processDictationHTML(
    text: string, 
    options: DictationProcessingOptions
  ): string {
    if (!text.trim()) return "";

    const { currentSentenceIndex, isSpeaking, dictationSentenceIndex, savedDictationInputs = {} } = options;
    
    // Process all sentences using the same logic as the speech hook
    const allSentences = this.processSentences(text);

    // Create a mapping of sentence text to global index
    const sentenceToIndexMap = new Map<string, number>();
    allSentences.forEach((sentence, index) => {
      sentenceToIndexMap.set(sentence.trim(), index);
    });

    // Helper function to generate sentence ID (matching useDictationStorage logic)
    const generateSentenceId = (sentenceText: string, sentenceIndex: number) => {
      const textHash = sentenceText.trim().substring(0, 50);
      return `${sentenceIndex}-${textHash}`;
    };

    // Helper function to generate progress display for inactive sentences
    const generateProgressDisplay = (sentence: string, sentenceIndex: number): string => {
      const sentenceId = generateSentenceId(sentence, sentenceIndex);
      const savedInput = savedDictationInputs[sentenceId] || '';
      
      if (!savedInput.trim()) {
        // No saved progress - show basic masked text
        return this.generateMaskedText(sentence.trim());
      }

      // Generate display with saved progress
      const userLetters = savedInput.replace(/\s+/g, '');
      const tokens = sentence.trim().split(/(\s+)/);
      let globalLetterIndex = 0;
      let result = '';

      for (const token of tokens) {
        if (token.trim() === '') {
          // Whitespace
          result += '&nbsp;';
        } else {
          const cleanWord = token.replace(/[^a-zA-Z]/g, '');
          if (cleanWord.length === 0) {
            // Pure punctuation
            result += `<span class="text-gray-700">${token}</span>`;
          } else {
            // Word with letters
            for (const char of token) {
              if (/[a-zA-Z]/.test(char)) {
                const userChar = userLetters[globalLetterIndex];
                if (globalLetterIndex < userLetters.length && userChar) {
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
                // Punctuation within word
                result += `<span class="text-gray-700">${char}</span>`;
              }
            }
          }
        }
      }

      return result;
    };

    // Split into paragraphs for visual layout
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0);

    return paragraphs
      .map((paragraph, paragraphIndex) => {
        // Split each paragraph into sentences using the same logic
        const paragraphSentences = this.processSentences(paragraph);

        const processedSentences = paragraphSentences
          .map((sentence) => {
            // Get the global index for this sentence
            const globalIndex = sentenceToIndexMap.get(sentence.trim()) || 0;

            // Check if this is the sentence being dictated
            const isDictationActive = dictationSentenceIndex === globalIndex;

            // Highlight current sentence when speaking or when explicitly selected
            const isCurrentSentence = globalIndex === currentSentenceIndex;
            const shouldHighlight = isCurrentSentence && (isSpeaking || currentSentenceIndex > 0);
            
            const sentenceClass = shouldHighlight
              ? "current-sentence bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-2 my-2 rounded-r-lg shadow-sm"
              : "sentence py-1 my-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors";

            if (isDictationActive) {
              // Show input field integrated with masked text for active dictation sentence
              return `<div class="${sentenceClass}" data-sentence-index="${globalIndex}">
                <div class="dictation-active-sentence p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div id="dictation-input-container-${globalIndex}" class="dictation-input-area relative"></div>
                </div>
              </div>`;
            } else {
              // Show progress display for inactive sentences
              const progressDisplay = generateProgressDisplay(sentence, globalIndex);
              return `<div class="${sentenceClass}" data-sentence-index="${globalIndex}">
                <div class="font-mono text-lg tracking-wider mb-2">${progressDisplay}</div>
              </div>`;
            }
          })
          .join("");

        // Wrap each paragraph with spacing
        const paragraphClass =
          paragraphIndex === 0
            ? "paragraph-block mb-8 first:mb-8"
            : "paragraph-block mb-8 pt-4 border-t border-gray-100";

        return `<div class="${paragraphClass}">${processedSentences}</div>`;
      })
      .join("");
  }

  /**
   * Extract clean word from text (removes punctuation)
   */
  static extractCleanWord(text: string): string {
    return text.replace(/[^A-Za-z']/g, "");
  }
} 
