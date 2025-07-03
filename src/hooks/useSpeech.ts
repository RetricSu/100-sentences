import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceOption } from '../types/index';

export const useSpeech = () => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(0.9);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Add refs to track speech state and cleanup
  const speakingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const speak = useCallback((text: string) => {
    if (!isSupported || !selectedVoice) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Clear any existing speech
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    utterance.rate = rate;
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
  }, [selectedVoice, rate, isSupported]);

  const speakAll = useCallback((text: string) => {
    if (!isSupported || !selectedVoice) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Clear any existing speech and timeouts
    window.speechSynthesis.cancel();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Split by sentences to avoid browser limitations
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentIndex = 0;
    let isCancelled = false;

    const speakNext = () => {
      if (isCancelled || currentIndex >= sentences.length) {
        speakingRef.current = false;
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        return;
      }

      const sentence = sentences[currentIndex].trim();
      if (sentence) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        utterance.rate = rate;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
          if (!isCancelled) {
            speakingRef.current = true;
            setIsSpeaking(true);
          }
        };
        
        utterance.onend = () => {
          if (!isCancelled) {
            currentIndex++;
            timeoutRef.current = setTimeout(speakNext, 200);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          speakingRef.current = false;
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        currentIndex++;
        timeoutRef.current = setTimeout(speakNext, 10);
      }
    };

    // Store cancel function for cleanup
    const cancelSpeech = () => {
      isCancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // Start speaking
    speakNext();

    // Return cleanup function (not used in this implementation but good practice)
    return cancelSpeech;
  }, [selectedVoice, rate, isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      // Clear all timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
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
  };
}; 
