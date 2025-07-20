import React, { createContext, useContext, ReactNode } from 'react';
import { useAppState, UseAppStateReturn } from '../hooks/useAppState';

// Create the context
const AppStateContext = createContext<UseAppStateReturn | null>(null);

// Provider component
interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const appState = useAppState();
  
  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use the context
export const useAppStateContext = (): UseAppStateReturn => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within an AppStateProvider');
  }
  return context;
}; 
