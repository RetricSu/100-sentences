import { useState, useEffect } from 'react';
import { DictionaryEntry } from '../types/index';
import { useTranslationContext } from '../contexts/TranslationContext';

export const useDictionary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const translation = useTranslationContext();

  // Initialize translation model on app start
  useEffect(() => {
    const initializeModel = async () => {
      if (!translation.isReady && !translation.isDownloading && !dictionaryLoaded) {
        try {
          console.log('Initializing AI translation model on app start...');
          await translation.initializeModel();
        } catch (err) {
          console.error('Failed to initialize translation model:', err);
          setError('Failed to initialize AI translation model');
        }
      }
    };

    initializeModel();
  }, [translation.isReady, translation.isDownloading, dictionaryLoaded, translation.initializeModel]);

  // Update loading progress based on translation service
  useEffect(() => {
    if (translation.isDownloading) {
      setLoadingProgress(translation.downloadProgress);
    } else if (translation.isReady) {
      setLoadingProgress(100);
      setDictionaryLoaded(true);
    }
  }, [translation.isDownloading, translation.downloadProgress, translation.isReady]);

  const lookupWord = async (word: string): Promise<DictionaryEntry | null> => {
    if (!translation.isReady) {
      console.warn('Translation model not ready yet');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // First, try to get English definition from online API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      let englishDefinition = '';
      let phonetic = '';
      let meanings: any[] = [];

      if (response.ok) {
        const data = await response.json();
        const entry = data[0];
        
        phonetic = entry.phonetic || entry.phonetics?.[0]?.text || '';
        meanings = entry.meanings.map((meaning: any) => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: meaning.definitions[0]?.definition || 'No definition available',
          example: meaning.definitions[0]?.example,
        }));
        
        // Get the first definition for translation
        englishDefinition = meanings[0]?.definition || word;
      } else {
        // If API fails, use the word itself for translation
        englishDefinition = word;
      }

      // Use AI translation to get Chinese translation
      let chineseTranslation = '';
      try {
        const translationResult = await translation.translate(englishDefinition);
        chineseTranslation = translationResult.translationText;
      } catch (translationError) {
        console.warn('Translation failed, falling back to word-only translation');
        // Fallback: try translating just the word
        try {
          const wordTranslationResult = await translation.translate(word);
          chineseTranslation = wordTranslationResult.translationText;
        } catch (wordTranslationError) {
          console.error('Word translation also failed:', wordTranslationError);
          chineseTranslation = '翻译失败';
        }
      }

      return {
        phonetic,
        meanings,
        chinese: chineseTranslation,
      };
    } catch (err) {
      setError('Failed to look up word');
      console.error('Dictionary lookup error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    lookupWord,
    loading: loading || translation.isTranslating,
    error: error || translation.error,
    dictionaryLoaded,
    dictionarySize: translation.isReady ? 'AI-Powered' : 'Not Loaded',
    loadingProgress,
    isLoading: translation.isDownloading || translation.isTranslating,
  };
}; 
