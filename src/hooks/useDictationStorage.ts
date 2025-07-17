import { useState, useCallback, useEffect } from 'react';

interface DictationStorage {
  [sentenceId: string]: string;
}

export const useDictationStorage = () => {
  const [dictationInputs, setDictationInputs] = useState<DictationStorage>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dictation-inputs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDictationInputs(parsed);
      }
    } catch (error) {
      console.error('Error loading dictation inputs:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever dictationInputs changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('dictation-inputs', JSON.stringify(dictationInputs));
      } catch (error) {
        console.error('Error saving dictation inputs:', error);
      }
    }
  }, [dictationInputs, isLoaded]);

  // Generate a unique sentence ID based on content and index
  const generateSentenceId = useCallback((sentenceText: string, sentenceIndex: number) => {
    // Use a combination of sentence content hash and index for uniqueness
    const textHash = sentenceText.trim().substring(0, 50); // Use first 50 chars as identifier
    return `${sentenceIndex}-${textHash}`;
  }, []);

  // Get input for a specific sentence
  const getDictationInput = useCallback((sentenceText: string, sentenceIndex: number) => {
    const sentenceId = generateSentenceId(sentenceText, sentenceIndex);
    return dictationInputs[sentenceId] || '';
  }, [dictationInputs, generateSentenceId]);

  // Save input for a specific sentence
  const saveDictationInput = useCallback((sentenceText: string, sentenceIndex: number, input: string) => {
    const sentenceId = generateSentenceId(sentenceText, sentenceIndex);
    setDictationInputs(prev => ({
      ...prev,
      [sentenceId]: input
    }));
  }, [generateSentenceId]);

  // Clear input for a specific sentence
  const clearDictationInput = useCallback((sentenceText: string, sentenceIndex: number) => {
    const sentenceId = generateSentenceId(sentenceText, sentenceIndex);
    setDictationInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[sentenceId];
      return newInputs;
    });
  }, [generateSentenceId]);

  // Clear all dictation inputs
  const clearAllDictationInputs = useCallback(() => {
    setDictationInputs({});
  }, []);

  // Get all dictation inputs
  const getAllDictationInputs = useCallback(() => {
    return dictationInputs;
  }, [dictationInputs]);

  return {
    getDictationInput,
    saveDictationInput,
    clearDictationInput,
    clearAllDictationInputs,
    getAllDictationInputs,
    isLoaded
  };
}; 
