import { useState, useEffect } from 'react';
import { DictionaryEntry } from '../types/index';
import { ecdictService } from '../data/ecdictService';

export const useDictionary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dictionaryLoaded, setDictionaryLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load ECDICT on initialization
  useEffect(() => {
    const loadECDict = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        
        await ecdictService.loadDictionary((progress) => {
          setLoadingProgress(Math.round(progress));
        });
        
        setDictionaryLoaded(true);
        setLoadingProgress(100);
        console.log('ECDICT loaded successfully');
      } catch (err) {
        setError('Failed to load dictionary');
        console.error('Error loading ECDICT:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!ecdictService.isLoaded()) {
      loadECDict();
    } else {
      setDictionaryLoaded(true);
      setLoadingProgress(100);
    }
  }, []);

  const lookupWord = async (word: string): Promise<DictionaryEntry | null> => {
    if (!dictionaryLoaded) {
      console.warn('Dictionary not loaded yet');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Try ECDICT first (offline dictionary with Chinese translations)
      const ecdictResult = ecdictService.lookupWord(word);
      if (ecdictResult) {
        return ecdictResult;
      }

      // If not found in ECDICT, try the online API as fallback
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const entry = data[0];

      return {
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text || undefined,
        meanings: entry.meanings.map((meaning: any) => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: meaning.definitions[0]?.definition || 'No definition available',
          example: meaning.definitions[0]?.example,
        })),
        chinese: undefined, // Online API doesn't provide Chinese translations
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
    loading,
    error,
    dictionaryLoaded,
    dictionarySize: ecdictService.getDictionarySize(),
    loadingProgress,
    isLoading: ecdictService.isLoading(),
  };
}; 
