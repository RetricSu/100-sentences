import { useState, useCallback, useEffect } from 'react';
import { WrongWordBook, WrongWordEntry } from '../types/dictation';

export interface UseWrongWordBookReturn {
  wrongWordBook: WrongWordBook;
  isLoaded: boolean;
  addWrongWord: (entry: Omit<WrongWordEntry, 'id' | 'createdAt' | 'practiceCount'>) => void;
  removeWrongWord: (textId: string, entryId: string) => void;
  updatePracticeCount: (textId: string, entryId: string) => void;
  clearWrongWordBook: () => void;
  getWrongWordsByText: (textId: string) => WrongWordEntry[];
  getAllWrongWords: () => WrongWordEntry[];
}

export const useWrongWordBook = (): UseWrongWordBookReturn => {
  const [wrongWordBook, setWrongWordBook] = useState<WrongWordBook>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wrong-word-book');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const processedBook: WrongWordBook = {};
        Object.keys(parsed).forEach(textId => {
          processedBook[textId] = {
            textTitle: parsed[textId].textTitle,
            entries: parsed[textId].entries.map((entry: any) => ({
              ...entry,
              createdAt: new Date(entry.createdAt),
              lastPracticed: entry.lastPracticed ? new Date(entry.lastPracticed) : undefined,
            }))
          };
        });
        setWrongWordBook(processedBook);
      }
    } catch (error) {
      console.error('Error loading wrong word book:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever wrongWordBook changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('wrong-word-book', JSON.stringify(wrongWordBook));
      } catch (error) {
        console.error('Error saving wrong word book:', error);
      }
    }
  }, [wrongWordBook, isLoaded]);

  // Generate a unique text ID based on content
  const generateTextId = useCallback((textTitle: string) => {
    return textTitle.trim().substring(0, 50).replace(/\s+/g, '-').toLowerCase();
  }, []);

  // Add a wrong word entry
  const addWrongWord = useCallback((entry: Omit<WrongWordEntry, 'id' | 'createdAt' | 'practiceCount'>) => {
    const textId = generateTextId(entry.textTitle);
    const newEntry: WrongWordEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
      practiceCount: 0,
    };

    setWrongWordBook(prev => ({
      ...prev,
      [textId]: {
        textTitle: entry.textTitle,
        entries: [...(prev[textId]?.entries || []), newEntry]
      }
    }));
  }, [generateTextId]);

  // Remove a wrong word entry
  const removeWrongWord = useCallback((textId: string, entryId: string) => {
    setWrongWordBook(prev => {
      const textEntries = prev[textId];
      if (!textEntries) return prev;

      const updatedEntries = textEntries.entries.filter(entry => entry.id !== entryId);
      
      if (updatedEntries.length === 0) {
        // Remove the entire text entry if no entries remain
        const newBook = { ...prev };
        delete newBook[textId];
        return newBook;
      }

      return {
        ...prev,
        [textId]: {
          ...textEntries,
          entries: updatedEntries
        }
      };
    });
  }, []);

  // Update practice count for a wrong word
  const updatePracticeCount = useCallback((textId: string, entryId: string) => {
    setWrongWordBook(prev => {
      const textEntries = prev[textId];
      if (!textEntries) return prev;

      const updatedEntries = textEntries.entries.map(entry => 
        entry.id === entryId 
          ? { ...entry, practiceCount: entry.practiceCount + 1, lastPracticed: new Date() }
          : entry
      );

      return {
        ...prev,
        [textId]: {
          ...textEntries,
          entries: updatedEntries
        }
      };
    });
  }, []);

  // Clear all wrong words
  const clearWrongWordBook = useCallback(() => {
    setWrongWordBook({});
  }, []);

  // Get wrong words for a specific text
  const getWrongWordsByText = useCallback((textId: string) => {
    return wrongWordBook[textId]?.entries || [];
  }, [wrongWordBook]);

  // Get all wrong words across all texts
  const getAllWrongWords = useCallback(() => {
    return Object.values(wrongWordBook).flatMap(text => text.entries);
  }, [wrongWordBook]);

  return {
    wrongWordBook,
    isLoaded,
    addWrongWord,
    removeWrongWord,
    updatePracticeCount,
    clearWrongWordBook,
    getWrongWordsByText,
    getAllWrongWords,
  };
}; 
