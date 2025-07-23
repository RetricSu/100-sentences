import { useState, useCallback, useEffect } from 'react';
import { TranslationService, TranslationResult, TranslationProgress } from '../services/translationService';

export interface UseTranslationReturn {
  // State
  isReady: boolean;
  isTranslating: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  lastTranslation: TranslationResult | null;
  error: string | null;
  
  // Actions
  translate: (text: string) => Promise<TranslationResult>;
  initializeModel: () => Promise<void>;
  reset: () => void;
  
  // Progress tracking
  progress: TranslationProgress | null;
}

/**
 * Custom hook for managing translation functionality
 * Provides a clean interface to the TranslationService with proper state management
 */
export const useTranslation = (): UseTranslationReturn => {
  const [isReady, setIsReady] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [lastTranslation, setLastTranslation] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<TranslationProgress | null>(null);

  // Get singleton instance of translation service
  const translationService = TranslationService.getInstance();

  // Progress callback for tracking model download and translation progress
  const handleProgress = useCallback((progress: TranslationProgress) => {
    setProgress(progress);
    
    switch (progress.status) {
      case 'downloading':
        setIsDownloading(true);
        setDownloadProgress(progress.progress || 0);
        setError(null);
        break;
      case 'loading':
        setIsDownloading(true);
        setError(null);
        break;
      case 'translating':
        setIsTranslating(true);
        setError(null);
        break;
      case 'completed':
        setIsDownloading(false);
        setIsTranslating(false);
        setIsReady(true);
        setDownloadProgress(100);
        setError(null);
        break;
      case 'error':
        setIsDownloading(false);
        setIsTranslating(false);
        setIsReady(false);
        setError(progress.error || 'An unknown error occurred');
        break;
      default:
        break;
    }
  }, []);

  // Initialize the translation model
  const initializeModel = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await translationService.initializeModel(handleProgress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize translation model';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [translationService, handleProgress]);

  // Translate text
  const translate = useCallback(async (text: string): Promise<TranslationResult> => {
    try {
      setError(null);
      setIsTranslating(true);
      
      const result = await translationService.translate(text, handleProgress);
      setLastTranslation(result);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [translationService, handleProgress]);

  // Reset the service state
  const reset = useCallback(() => {
    translationService.reset();
    setIsReady(false);
    setIsTranslating(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    setLastTranslation(null);
    setError(null);
    setProgress(null);
  }, [translationService]);

  // Check if service is ready on mount
  useEffect(() => {
    setIsReady(translationService.isReady());
  }, [translationService]);

  return {
    isReady,
    isTranslating,
    isDownloading,
    downloadProgress,
    lastTranslation,
    error,
    translate,
    initializeModel,
    reset,
    progress
  };
}; 
