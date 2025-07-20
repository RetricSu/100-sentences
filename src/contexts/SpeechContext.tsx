import React, { createContext, useContext, ReactNode } from 'react';
import { useSpeech } from '../hooks/useSpeech';

// Create the context with the speech hook return type
const SpeechContext = createContext<ReturnType<typeof useSpeech> | null>(null);

// Provider component
interface SpeechProviderProps {
  children: ReactNode;
}

export const SpeechProvider: React.FC<SpeechProviderProps> = ({ children }) => {
  const speech = useSpeech();
  
  return (
    <SpeechContext.Provider value={speech}>
      {children}
    </SpeechContext.Provider>
  );
};

// Custom hook to use the context
export const useSpeechContext = (): ReturnType<typeof useSpeech> => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeechContext must be used within a SpeechProvider');
  }
  return context;
}; 
