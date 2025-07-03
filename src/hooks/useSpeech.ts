import { useState, useEffect, useCallback } from 'react';
import { VoiceOption } from '../types/index';

export const useSpeech = () => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(0.9);
  const [isSupported, setIsSupported] = useState(false);

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

  const speak = useCallback((text: string) => {
    if (!isSupported || !selectedVoice) {
      console.warn('Speech synthesis not available');
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, rate, isSupported]);

  const speakAll = useCallback((text: string) => {
    if (!isSupported || !selectedVoice) {
      console.warn('Speech synthesis not available');
      return;
    }

    window.speechSynthesis.cancel();
    
    // Split by sentences to avoid browser limitations
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= sentences.length) return;

      const sentence = sentences[currentIndex].trim();
      if (sentence) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        utterance.rate = rate;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          currentIndex++;
          setTimeout(speakNext, 200);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        currentIndex++;
        speakNext();
      }
    };

    speakNext();
  }, [selectedVoice, rate, isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
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
    setSelectedVoice,
    setRate,
    speak,
    speakAll,
    stop,
    testVoice,
  };
}; 
