import { TextProcessor } from '../services/textProcessor';

export interface ProcessedParagraph {
  sentences: string[];
  sentenceIndices: number[];
  isFirstParagraph: boolean;
}

export interface ProcessedContent {
  paragraphs: ProcessedParagraph[];
}

/**
 * Process text into structured data for React components
 * This replaces the HTML string generation approach
 */
export const processTextToStructuredData = (
  text: string
): ProcessedContent | null => {
  if (!text.trim()) return null;
  
  const allSentences = TextProcessor.processSentences(text);
  
  // Create a mapping of sentence text to global index
  const sentenceToIndexMap = new Map<string, number>();
  allSentences.forEach((sentence, index) => {
    sentenceToIndexMap.set(sentence.trim(), index);
  });

  // Split into paragraphs for visual layout
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  const processedParagraphs = paragraphs.map((paragraph, paragraphIndex) => {
    const paragraphSentences = TextProcessor.processSentences(paragraph);
    const sentenceIndices = paragraphSentences.map(sentence => 
      sentenceToIndexMap.get(sentence.trim()) || 0
    );

    return {
      sentences: paragraphSentences,
      sentenceIndices,
      isFirstParagraph: paragraphIndex === 0
    };
  });

  return {
    paragraphs: processedParagraphs
  };
};

/**
 * Extract clean word from text (removes punctuation)
 * This is a utility function that can be reused
 */
export const extractCleanWord = (text: string): string => {
  return text.replace(/[^A-Za-z']/g, "");
};

/**
 * Check if a sentence should be highlighted based on current state
 */
export const shouldHighlightSentence = (
  sentenceIndex: number,
  currentSentenceIndex: number,
  isSpeaking: boolean
): boolean => {
  return sentenceIndex === currentSentenceIndex && (isSpeaking || currentSentenceIndex > 0);
}; 
