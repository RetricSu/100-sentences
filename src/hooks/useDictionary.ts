import { useState, useCallback } from 'react';
import { DictionaryEntry, ApiWordData } from '../types/index';
import { offlineDictionary } from '../data/offlineDictionary';

interface DictionaryState {
  word: string;
  data: DictionaryEntry | null;
  loading: boolean;
  error: string | null;
  isVisible: boolean;
}

export const useDictionary = () => {
  const [state, setState] = useState<DictionaryState>({
    word: '',
    data: null,
    loading: false,
    error: null,
    isVisible: false,
  });

  const lookupWord = useCallback(async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    
    setState(prev => ({
      ...prev,
      word: cleanWord,
      loading: true,
      error: null,
      isVisible: true,
    }));

    try {
      // Try API first
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      
      if (response.ok) {
        const data: ApiWordData[] = await response.json();
        const wordData = data[0];
        
        const dictionaryEntry: DictionaryEntry = {
          phonetic: wordData.phonetic || (wordData.phonetics?.[0]?.text),
          meanings: wordData.meanings.slice(0, 3).map(meaning => ({
            partOfSpeech: meaning.partOfSpeech,
            definition: meaning.definitions[0]?.definition || '',
            example: meaning.definitions[0]?.example,
          })),
        };
        
        setState(prev => ({
          ...prev,
          data: dictionaryEntry,
          loading: false,
        }));
      } else {
        // Fallback to offline dictionary
        useOfflineDictionary(cleanWord);
      }
    } catch (error) {
      console.log('API failed, using offline dictionary');
      useOfflineDictionary(cleanWord);
    }
  }, []);

  const useOfflineDictionary = useCallback((word: string) => {
    if (offlineDictionary[word]) {
      setState(prev => ({
        ...prev,
        data: offlineDictionary[word],
        loading: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: 'Word not found in dictionary',
      }));
    }
  }, []);

  const closeDictionary = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return {
    ...state,
    lookupWord,
    closeDictionary,
  };
}; 
