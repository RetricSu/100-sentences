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
  const { getAllRecitationInputs, saveRecitationInput, isLoaded: isRecitationStorageLoaded } = useRecitationStorage();
  
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
  const sessionTranscriptRef = useRef<string>('');



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
    // Reset session transcript when switching sentences
    sessionTranscriptRef.current = '';
  }, []);

  // Update input for a sentence
  const updateInput = useCallback((sentence: string, sentenceIndex: number, input: string) => {
    const sentenceId = RecitationDisplayUtils.generateSentenceId(sentence.trim(), sentenceIndex);
    setActiveInputs(prev => ({
      ...prev,
      [sentenceId]: input
    }));
    
    // Save to storage immediately
    if (isRecitationStorageLoaded) {
      saveRecitationInput(sentence, sentenceIndex, input);
    }
  }, [isRecitationStorageLoaded, saveRecitationInput]);

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
      sessionTranscriptRef.current = '';
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
        
        if (finalTranscript) {
          // Accumulate the final transcript for this session
          sessionTranscriptRef.current += finalTranscript;
          console.log('Session transcript:', sessionTranscriptRef.current);
          console.log('Updating input with:', sessionTranscriptRef.current, 'for sentence:', currentSentence);
          updateInput(currentSentence, currentSentenceIndexRef.current, sessionTranscriptRef.current);
        } else if (interimTranscript) {
          // For interim results, show the accumulated transcript + interim
          const displayTranscript = sessionTranscriptRef.current + interimTranscript;
          console.log('Updating interim input with:', displayTranscript);
          updateInput(currentSentence, currentSentenceIndexRef.current, displayTranscript);
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
        sessionTranscriptRef.current = '';
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

  // Save current state before page unload
  useEffect(() => {
    if (!isRecitationStorageLoaded || !isActive) return;

    const handleBeforeUnload = () => {
      // Save all active inputs before page unload
      Object.entries(activeInputs).forEach(([sentenceId, input]) => {
        if (input.trim()) {
          // Extract sentence index and content from sentenceId (format: "index-textHash")
          const parts = sentenceId.split('-');
          const sentenceIndex = parseInt(parts[0]);
          const storedContentHash = parts.slice(1).join('-');
          
          // Find the matching sentence by content hash
          for (let i = 0; i < speech.sentences.length; i++) {
            const currentSentence = speech.sentences[i];
            const currentContentHash = currentSentence.trim().substring(0, 50);
            
            if (currentContentHash === storedContentHash) {
              saveRecitationInput(currentSentence, sentenceIndex, input);
              break;
            }
          }
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRecitationStorageLoaded, isActive, activeInputs, speech.sentences, saveRecitationInput]);

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
