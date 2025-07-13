export interface ProcessedTextOptions {
  currentSentenceIndex: number;
  isSpeaking: boolean;
}

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
   * Extract clean word from text (removes punctuation)
   */
  static extractCleanWord(text: string): string {
    return text.replace(/[^A-Za-z']/g, "");
  }
} 
