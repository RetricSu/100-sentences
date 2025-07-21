import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRecitationStorage } from '../hooks/useRecitationStorage';
import { useSpeechContext } from './SpeechContext';
import { RecitationDisplayUtils } from '../utils/recitationDisplay';

interface RecitationContextType {
  // State
  isActive: boolean;
  currentSentenceIndex: number | null;
  activeInputs: Record<string, string>;
  storedInputs: Record<string, string>;
  isLoaded: boolean;
  isListening: boolean;
  recognition: SpeechRecognition | null;
  
  // Actions
  activate: () => void;
  deactivate: () => void;
  setCurrentSentence: (index: number | null) => void;
  updateInput: (sentence: string, sentenceIndex: number, input: string) => void;
  onComplete: () => void;
  startListening: () => void;
  stopListening: () => void;
}

const RecitationContext = createContext<RecitationContextType | null>(null);

interface RecitationProviderProps {
  children: React.ReactNode;
}

export const RecitationProvider: React.FC<RecitationProviderProps> = ({ children }) => {
  const speech = useSpeechContext();
  const { getAllRecitationInputs, isLoaded: isRecitationStorageLoaded } = useRecitationStorage();
  
  // Recitation state
  const [isActive, setIsActive] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number | null>(null);
  const [activeInputs, setActiveInputs] = useState<Record<string, string>>({});
  const [storedInputs, setStoredInputs] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  // Use ref to always get current value in speech recognition callback
  const currentSentenceIndexRef = useRef<number | null>(null);
  const shouldBeListeningRef = useRef<boolean>(false);



  // Activate recitation mode
  const activate = useCallback(() => {
    setIsActive(true);
    setCurrentSentenceIndex(0); // Start with the first sentence
    currentSentenceIndexRef.current = 0;
  }, []);

  // Deactivate recitation mode
  const deactivate = useCallback(() => {
    setIsActive(false);
    setCurrentSentenceIndex(null);
    currentSentenceIndexRef.current = null;
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  // Set current sentence for recitation
  const setCurrentSentence = useCallback((index: number | null) => {
    setCurrentSentenceIndex(index);
    currentSentenceIndexRef.current = index;
  }, []);

  // Update input for a sentence
  const updateInput = useCallback((sentence: string, sentenceIndex: number, input: string) => {
    const sentenceId = RecitationDisplayUtils.generateSentenceId(sentence.trim(), sentenceIndex);
    setActiveInputs(prev => ({
      ...prev,
      [sentenceId]: input
    }));
  }, []);

  // Handle recitation completion
  const onComplete = useCallback(() => {
    if (currentSentenceIndex !== null && currentSentenceIndex < speech.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      speech.jumpToSentence(currentSentenceIndex + 1);
    } else {
      setCurrentSentenceIndex(null);
    }
  }, [currentSentenceIndex, speech]);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      shouldBeListeningRef.current = true;
    };

    recognitionInstance.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // In continuous mode, if we're still supposed to be listening, restart
      // This handles cases where the browser ends recognition unexpectedly
      if (shouldBeListeningRef.current && recognition) {
        console.log('Restarting speech recognition...');
        setTimeout(() => {
          if (shouldBeListeningRef.current && recognition) {
            try {
              recognition.start();
            } catch (error) {
              console.error('Error restarting speech recognition:', error);
            }
          }
        }, 100);
      }
    };

    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      console.log('Speech recognition result:', { finalTranscript, interimTranscript, currentSentenceIndex: currentSentenceIndexRef.current });

      if (currentSentenceIndexRef.current !== null) {
        const currentSentence = speech.sentences[currentSentenceIndexRef.current];
        const sentenceId = RecitationDisplayUtils.generateSentenceId(currentSentence.trim(), currentSentenceIndexRef.current);
        
        // Get current input for this sentence
        const currentInput = activeInputs[sentenceId] || '';
        
        if (finalTranscript) {
          // In continuous mode, the final transcript should be the complete transcript
          // We should replace the current input with the new complete transcript
          console.log('Updating input with:', finalTranscript, 'for sentence:', currentSentence);
          updateInput(currentSentence, currentSentenceIndexRef.current, finalTranscript);
        } else if (interimTranscript) {
          // For interim results, show the complete transcript so far
          console.log('Updating interim input with:', interimTranscript);
          updateInput(currentSentence, currentSentenceIndexRef.current, interimTranscript);
        }
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle specific error types
      if (event.error === 'no-speech') {
        console.log('No speech detected, but continuing to listen...');
        // Don't stop listening for no-speech errors in continuous mode
        return;
      }
      
      if (event.error === 'audio-capture') {
        console.error('Audio capture error - microphone may not be available');
        setIsListening(false);
      }
      
      if (event.error === 'not-allowed') {
        console.error('Microphone permission denied');
        setIsListening(false);
      }
      
      // For other errors, stop listening
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    setRecognition(recognitionInstance);
  }, [speech.sentences, updateInput]);

  // Start listening for speech
  const startListening = useCallback(() => {
    console.log('Starting speech recognition...', { recognition: !!recognition, isListening });
    if (recognition && !isListening) {
      try {
        shouldBeListeningRef.current = true;
        recognition.start();
        console.log('Speech recognition start() called successfully');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        shouldBeListeningRef.current = false;
      }
    } else {
      console.log('Cannot start: recognition =', !!recognition, 'isListening =', isListening);
    }
  }, [recognition, isListening]);

  // Stop listening for speech
  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...', { recognition: !!recognition, isListening });
    if (recognition && isListening) {
      try {
        shouldBeListeningRef.current = false;
        recognition.stop();
        console.log('Speech recognition stop() called successfully');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    } else {
      console.log('Cannot stop: recognition =', !!recognition, 'isListening =', isListening);
    }
  }, [recognition, isListening]);

  // Sync stored inputs when storage is loaded or recitation state changes
  useEffect(() => {
    if (isRecitationStorageLoaded) {
      setStoredInputs(getAllRecitationInputs());
    }
  }, [isRecitationStorageLoaded, getAllRecitationInputs, currentSentenceIndex, isActive]);

  const value: RecitationContextType = {
    // State
    isActive,
    currentSentenceIndex,
    activeInputs,
    storedInputs,
    isLoaded: isRecitationStorageLoaded,
    isListening,
    recognition,
    
    // Actions
    activate,
    deactivate,
    setCurrentSentence,
    updateInput,
    onComplete,
    startListening,
    stopListening,
  };

  return (
    <RecitationContext.Provider value={value}>
      {children}
    </RecitationContext.Provider>
  );
};

export const useRecitationContext = (): RecitationContextType => {
  const context = useContext(RecitationContext);
  if (!context) {
    throw new Error('useRecitationContext must be used within a RecitationProvider');
  }
  return context;
}; 
