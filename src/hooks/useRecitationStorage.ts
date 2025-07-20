import { useState, useCallback, useEffect } from 'react';
import { RecitationStorage, UseRecitationStorageReturn } from '../types/recitation';

export const useRecitationStorage = (): UseRecitationStorageReturn => {
  const [recitationInputs, setRecitationInputs] = useState<RecitationStorage>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recitation-inputs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecitationInputs(parsed);
      }
    } catch (error) {
      console.error('Error loading recitation inputs:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever recitationInputs changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('recitation-inputs', JSON.stringify(recitationInputs));
      } catch (error) {
        console.error('Error saving recitation inputs:', error);
      }
    }
  }, [recitationInputs, isLoaded]);

  // Generate a unique sentence ID based on content and index
  const generateSentenceId = useCallback((sentenceText: string, sentenceIndex: number) => {
    // Use a combination of sentence content hash and index for uniqueness
    const textHash = sentenceText.trim().substring(0, 50); // Use first 50 chars as identifier
    return `${sentenceIndex}-${textHash}`;
  }, []);

  // Get input for a specific sentence
  const getRecitationInput = useCallback((sentenceText: string, sentenceIndex: number) => {
    const sentenceId = generateSentenceId(sentenceText, sentenceIndex);
    return recitationInputs[sentenceId] || '';
  }, [recitationInputs, generateSentenceId]);

  // Save input for a specific sentence
  const saveRecitationInput = useCallback((sentenceText: string, sentenceIndex: number, input: string) => {
    const sentenceId = generateSentenceId(sentenceText, sentenceIndex);
    setRecitationInputs(prev => ({
      ...prev,
      [sentenceId]: input
    }));
  }, [generateSentenceId]);

  // Clear input for a specific sentence
  const clearRecitationInput = useCallback((sentenceText: string, sentenceIndex: number) => {
    const sentenceId = generateSentenceId(sentenceText, sentenceIndex);
    setRecitationInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[sentenceId];
      return newInputs;
    });
  }, [generateSentenceId]);

  // Clear all recitation inputs
  const clearAllRecitationInputs = useCallback(() => {
    setRecitationInputs({});
  }, []);

  // Get all recitation inputs
  const getAllRecitationInputs = useCallback(() => {
    return recitationInputs;
  }, [recitationInputs]);

  return {
    getRecitationInput,
    saveRecitationInput,
    clearRecitationInput,
    clearAllRecitationInputs,
    getAllRecitationInputs,
    isLoaded
  };
}; 
