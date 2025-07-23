import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation, UseTranslationReturn } from '../hooks/useTranslation';

// Create the context
const TranslationContext = createContext<UseTranslationReturn | null>(null);

// Provider component
interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const translationState = useTranslation();
  
  return (
    <TranslationContext.Provider value={translationState}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use the context
export const useTranslationContext = (): UseTranslationReturn => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}; 
