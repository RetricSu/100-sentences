import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceOption } from '../types/index';

export const useSpeech = () => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(0.9);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Enhanced sentence-based playback state
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  
  // Add refs to track speech state and cleanup
  const speakingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sequenceRef = useRef<{ isCancelled: boolean; startIndex: number }>({ isCancelled: false, startIndex: 0 });
  
  // Refs to always use latest voice and rate values
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const rateRef = useRef<number>(0.9);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    setIsSupported(true);
    
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices
        .filter(voice => voice.lang.startsWith('en'))
        .map((voice, index) => ({ voice, index }));
      
      setVoices(englishVoices);

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
        setSelectedVoice(bestVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Keep refs synchronized with state
  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  // Add effect to sync isSpeaking state with speech synthesis
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSupported) {
        const synthesisSpeaking = window.speechSynthesis.speaking;
        if (speakingRef.current !== synthesisSpeaking) {
          speakingRef.current = synthesisSpeaking;
          setIsSpeaking(synthesisSpeaking);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isSupported]);

  // Enhanced text processing to split into sentences
  const processSentences = useCallback((text: string) => {
    if (!text.trim()) return [];
    
    // Split by sentences with better regex that handles abbreviations
    const rawSentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    // Clean up sentences and ensure they end with punctuation
    const processedSentences = rawSentences.map(sentence => {
      const trimmed = sentence.trim();
      if (trimmed && !trimmed.match(/[.!?]$/)) {
        return trimmed + '.';
      }
      return trimmed;
    }).filter(s => s.length > 0);
    
    return processedSentences;
  }, []);

  // Update sentences when text changes
  const updateSentences = useCallback((text: string) => {
    const newSentences = processSentences(text);
    setSentences(newSentences);
    setCurrentSentenceIndex(0);
    return newSentences;
  }, [processSentences]);

  // Enhanced speak function to handle sentence context
  const speak = useCallback((text: string, sentenceIndex?: number) => {
    if (!isSupported || !selectedVoiceRef.current) {
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
      setCurrentSentenceIndex(sentenceIndex);
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoiceRef.current;
    utterance.lang = selectedVoiceRef.current.lang;
    utterance.rate = rateRef.current;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      speakingRef.current = true;
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      speakingRef.current = false;
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    
    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  // Speak current sentence
  const speakCurrentSentence = useCallback(() => {
    if (sentences.length > 0 && currentSentenceIndex < sentences.length) {
      speak(sentences[currentSentenceIndex], currentSentenceIndex);
    }
  }, [sentences, currentSentenceIndex, speak]);

  // Navigate to next sentence
  const nextSentence = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      const nextIndex = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIndex);
      if (isSpeaking) {
        speak(sentences[nextIndex], nextIndex);
      }
    }
  }, [currentSentenceIndex, sentences, isSpeaking, speak]);

  // Navigate to previous sentence
  const previousSentence = useCallback(() => {
    if (currentSentenceIndex > 0) {
      const prevIndex = currentSentenceIndex - 1;
      setCurrentSentenceIndex(prevIndex);
      if (isSpeaking) {
        speak(sentences[prevIndex], prevIndex);
      }
    }
  }, [currentSentenceIndex, sentences, isSpeaking, speak]);

  // Jump to specific sentence
  const jumpToSentence = useCallback((index: number) => {
    if (index >= 0 && index < sentences.length) {
      setCurrentSentenceIndex(index);
      if (isSpeaking) {
        speak(sentences[index], index);
      }
    }
  }, [sentences, isSpeaking, speak]);

  // Enhanced speakAll with sentence sequence control
  const speakAll = useCallback((text: string, startFromIndex: number = 0) => {
    if (!isSupported || !selectedVoiceRef.current) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Clear any existing speech and timeouts
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Process sentences
    const processedSentences = processSentences(text);
    setSentences(processedSentences);
    
    if (processedSentences.length === 0) return;
    
    // Reset sequence state
    sequenceRef.current = { isCancelled: false, startIndex: startFromIndex };
    setIsPlayingSequence(true);
    
    let currentIndex = Math.max(0, Math.min(startFromIndex, processedSentences.length - 1));
    setCurrentSentenceIndex(currentIndex);

    const speakNext = () => {
      if (sequenceRef.current.isCancelled || currentIndex >= processedSentences.length) {
        speakingRef.current = false;
        setIsSpeaking(false);
        setIsPlayingSequence(false);
        currentUtteranceRef.current = null;
        return;
      }

      const sentence = processedSentences[currentIndex].trim();
      if (sentence) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.voice = selectedVoiceRef.current;
        utterance.lang = selectedVoiceRef.current?.lang || 'en-US';
        utterance.rate = rateRef.current;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
          if (!sequenceRef.current.isCancelled) {
            speakingRef.current = true;
            setIsSpeaking(true);
            setCurrentSentenceIndex(currentIndex);
          }
        };
        
        utterance.onend = () => {
          if (!sequenceRef.current.isCancelled) {
            currentIndex++;
            timeoutRef.current = setTimeout(speakNext, 300);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          speakingRef.current = false;
          setIsSpeaking(false);
          setIsPlayingSequence(false);
          currentUtteranceRef.current = null;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        currentIndex++;
        timeoutRef.current = setTimeout(speakNext, 10);
      }
    };

    // Start speaking
    speakNext();
  }, [isSupported, processSentences]);

  // Enhanced stop function
  const stop = useCallback(() => {
    if (isSupported) {
      // Clear all timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Cancel sequence
      sequenceRef.current.isCancelled = true;
      setIsPlayingSequence(false);
      
      // Cancel speech synthesis
      window.speechSynthesis.cancel();
      
      // Reset state immediately
      speakingRef.current = false;
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, [isSupported]);

  const testVoice = useCallback(() => {
    speak("Hello! This is a test of the selected voice. How do you like it?");
  }, [speak]);

  return {
    voices,
    selectedVoice,
    rate,
    isSupported,
    isSpeaking,
    setSelectedVoice,
    setRate,
    speak,
    speakAll,
    stop,
    testVoice,
    // Enhanced sentence-based functionality
    sentences,
    currentSentenceIndex,
    isPlayingSequence,
    updateSentences,
    speakCurrentSentence,
    nextSentence,
    previousSentence,
    jumpToSentence,
  };
}; 
