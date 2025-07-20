import React, { createContext, useContext, ReactNode } from 'react';
import { useDictionary } from '../hooks/useDictionary';

// Create the context with the dictionary hook return type
const DictionaryContext = createContext<ReturnType<typeof useDictionary> | null>(null);

// Provider component
interface DictionaryProviderProps {
  children: ReactNode;
}

export const DictionaryProvider: React.FC<DictionaryProviderProps> = ({ children }) => {
  const dictionary = useDictionary();
  
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
};

// Custom hook to use the context
export const useDictionaryContext = (): ReturnType<typeof useDictionary> => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionaryContext must be used within a DictionaryProvider');
  }
  return context;
}; 
