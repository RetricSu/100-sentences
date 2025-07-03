export interface WordDefinition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

export interface DictionaryEntry {
  phonetic?: string;
  meanings: WordDefinition[];
  chinese?: string;
}

export interface ECDictEntry {
  word: string;
  phonetic?: string;
  definition?: string;
  translation?: string;
  pos?: string;
  collins?: string;
  oxford?: string;
  tag?: string;
  bnc?: string;
  frq?: string;
  exchange?: string;
  detail?: string;
  audio?: string;
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
