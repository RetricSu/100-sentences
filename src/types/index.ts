export interface WordDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

export interface DictionaryEntry {
  phonetic?: string;
  meanings: WordDefinition[];
}

export interface ApiWordData {
  word: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  index: number;
} 
