import { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { VoiceOption } from '../types/index';

interface SpeechState {
  // Text and sentence management
  originalText: string;
  sentences: string[];
  currentSentenceIndex: number;
  
  // Speech status
  isSpeaking: boolean;
  isPlayingSequence: boolean;
  
  // Voice settings
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  
  // System status
  isSupported: boolean;
  voices: VoiceOption[];
}

export const useSpeech = () => {
  // Core state
  const [state, setState] = useState<SpeechState>({
    originalText: '',
    sentences: [],
    currentSentenceIndex: 0,
    isSpeaking: false,
    isPlayingSequence: false,
    selectedVoice: null,
    rate: 0.9,
    isSupported: false,
    voices: [],
  });

  // Persistent storage for voice settings
  const [rate, setRate] = useLocalStorageState('tts-rate', { defaultValue: 0.9 });
  const [savedVoiceInfo, setSavedVoiceInfo] = useLocalStorageState<{name: string, lang: string} | null>('tts-voice', { defaultValue: null });
  
  // Refs for speech management
  const speakingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sequenceRef = useRef<{ isCancelled: boolean; startIndex: number }>({ isCancelled: false, startIndex: 0 });
  
  // Refs to always use latest values in speech callbacks
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const rateRef = useRef<number>(0.9);

  // Text processing utility
  const processSentences = useCallback((text: string): string[] => {
    if (!text.trim()) return [];
    
    const rawSentences = text
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);
    
    return rawSentences
      .map(sentence => {
        const trimmed = sentence.trim();
        if (trimmed && !trimmed.match(/[.!?]$/)) {
          return trimmed + '.';
        }
        return trimmed;
      })
      .filter(s => s.length > 0);
  }, []);

  // Update state helper
  const updateState = useCallback((updates: Partial<SpeechState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    updateState({ isSupported: true });
    
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices
        .filter(voice => voice.lang.startsWith('en'))
        .map((voice, index) => ({ voice, index }));
      
      updateState({ voices: englishVoices });

      // Try to restore saved voice first
      if (savedVoiceInfo) {
        const savedVoice = englishVoices.find(v => 
          v.voice.name === savedVoiceInfo.name && v.voice.lang === savedVoiceInfo.lang
        )?.voice;
        if (savedVoice) {
          updateState({ selectedVoice: savedVoice });
          return;
        }
      }

      // Auto-select best voice
      const bestVoice = englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.name.includes('Microsoft')
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.name.includes('David')
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.name.includes('Zira')
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.localService
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang.startsWith('en') && v.voice.localService
      )?.voice ||
      englishVoices[0]?.voice;

      if (bestVoice) {
        updateState({ selectedVoice: bestVoice });
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [savedVoiceInfo, updateState]);

  // Sync rate with localStorage
  useEffect(() => {
    updateState({ rate });
    rateRef.current = rate;
  }, [rate, updateState]);

  // Keep refs synchronized
  useEffect(() => {
    selectedVoiceRef.current = state.selectedVoice;
  }, [state.selectedVoice]);

  // Sync isSpeaking state with speech synthesis
  useEffect(() => {
    if (!state.isSupported) return;
    
    const interval = setInterval(() => {
      const synthesisSpeaking = window.speechSynthesis.speaking;
      if (speakingRef.current !== synthesisSpeaking) {
        speakingRef.current = synthesisSpeaking;
        updateState({ isSpeaking: synthesisSpeaking });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [state.isSupported, updateState]);

  // Main text setter - this is the primary way to update text
  const setText = useCallback((text: string) => {
    const sentences = processSentences(text);
    updateState({
      originalText: text,
      sentences,
      currentSentenceIndex: 0,
    });
  }, [processSentences, updateState]);

  // Voice selection with storage
  const setSelectedVoice = useCallback((voice: SpeechSynthesisVoice) => {
    updateState({ selectedVoice: voice });
    setSavedVoiceInfo({ name: voice.name, lang: voice.lang });
  }, [updateState, setSavedVoiceInfo]);

  // Core speak function
  const speak = useCallback((text: string, sentenceIndex?: number) => {
    if (!state.isSupported || !selectedVoiceRef.current) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Clear any existing speech
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Update current sentence index if provided
    if (sentenceIndex !== undefined) {
      updateState({ currentSentenceIndex: sentenceIndex });
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoiceRef.current;
    utterance.lang = selectedVoiceRef.current.lang;
    utterance.rate = rateRef.current;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      speakingRef.current = true;
      updateState({ isSpeaking: true });
    };
    
    utterance.onend = () => {
      speakingRef.current = false;
      updateState({ isSpeaking: false });
      currentUtteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      speakingRef.current = false;
      updateState({ isSpeaking: false });
      currentUtteranceRef.current = null;
    };
    
    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [state.isSupported, updateState]);

  // Navigation functions
  const jumpToSentence = useCallback((index: number) => {
    if (index >= 0 && index < state.sentences.length) {
      updateState({ currentSentenceIndex: index });
    }
  }, [state.sentences.length, updateState]);

  const nextSentence = useCallback(() => {
    if (state.currentSentenceIndex < state.sentences.length - 1) {
      const nextIndex = state.currentSentenceIndex + 1;
      updateState({ currentSentenceIndex: nextIndex });
    }
  }, [state.currentSentenceIndex, state.sentences.length, updateState]);

  const previousSentence = useCallback(() => {
    if (state.currentSentenceIndex > 0) {
      const prevIndex = state.currentSentenceIndex - 1;
      updateState({ currentSentenceIndex: prevIndex });
    }
  }, [state.currentSentenceIndex, updateState]);

  // Speak current sentence
  const speakCurrentSentence = useCallback(() => {
    if (state.sentences.length > 0 && state.currentSentenceIndex < state.sentences.length) {
      speak(state.sentences[state.currentSentenceIndex], state.currentSentenceIndex);
    }
  }, [state.sentences, state.currentSentenceIndex, speak]);

  // Speak all sentences from a starting point
  const speakAll = useCallback((startFromIndex: number = 0) => {
    if (!state.isSupported || !selectedVoiceRef.current || state.sentences.length === 0) {
      console.warn('Speech synthesis not available or no sentences');
      return;
    }

    // Clear any existing speech
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset sequence state
    sequenceRef.current = { isCancelled: false, startIndex: startFromIndex };
    updateState({ isPlayingSequence: true });
    
    // Use an object to track current index
    const indexTracker = { current: Math.max(0, Math.min(startFromIndex, state.sentences.length - 1)) };

    const speakNext = () => {
      if (sequenceRef.current.isCancelled || indexTracker.current >= state.sentences.length) {
        speakingRef.current = false;
        updateState({ isSpeaking: false, isPlayingSequence: false });
        currentUtteranceRef.current = null;
        return;
      }

      const sentence = state.sentences[indexTracker.current].trim();
      if (sentence) {
        const sentenceIndex = indexTracker.current;
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.voice = selectedVoiceRef.current;
        utterance.lang = selectedVoiceRef.current?.lang || 'en-US';
        utterance.rate = rateRef.current;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
          if (!sequenceRef.current.isCancelled) {
            speakingRef.current = true;
            updateState({ 
              isSpeaking: true, 
              currentSentenceIndex: sentenceIndex 
            });
          }
        };
        
        utterance.onend = () => {
          if (!sequenceRef.current.isCancelled) {
            indexTracker.current++;
            timeoutRef.current = setTimeout(speakNext, 300);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          speakingRef.current = false;
          updateState({ isSpeaking: false, isPlayingSequence: false });
          currentUtteranceRef.current = null;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        indexTracker.current++;
        timeoutRef.current = setTimeout(speakNext, 10);
      }
    };

    speakNext();
  }, [state.isSupported, state.sentences, updateState]);

  // Stop all speech
  const stop = useCallback(() => {
    if (state.isSupported) {
      // Clear all timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Cancel sequence
      sequenceRef.current.isCancelled = true;
      updateState({ isPlayingSequence: false });
      
      // Cancel speech synthesis
      window.speechSynthesis.cancel();
      
      // Reset state immediately
      speakingRef.current = false;
      updateState({ isSpeaking: false });
      currentUtteranceRef.current = null;
    }
  }, [state.isSupported, updateState]);

  // Test voice function
  const testVoice = useCallback(() => {
    speak("Hello! This is a test of the selected voice. How do you like it?");
  }, [speak]);

  // Return the hook interface
  return {
    // State
    originalText: state.originalText,
    sentences: state.sentences,
    currentSentenceIndex: state.currentSentenceIndex,
    isSpeaking: state.isSpeaking,
    isPlayingSequence: state.isPlayingSequence,
    isSupported: state.isSupported,
    voices: state.voices,
    selectedVoice: state.selectedVoice,
    rate: state.rate,
    
    // Actions
    setText,
    setSelectedVoice,
    setRate,
    speak,
    speakCurrentSentence,
    speakAll,
    stop,
    testVoice,
    jumpToSentence,
    nextSentence,
    previousSentence,
  };
}; 
