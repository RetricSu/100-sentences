import { DictionaryEntry, ECDictEntry } from '../types/index';

class ECDictService {
  private dictionary: Map<string, ECDictEntry> = new Map();
  private loaded = false;

  async loadDictionary(): Promise<void> {
    if (this.loaded) return;

    try {
      const response = await fetch('/ecdict_subset.csv');
      const csvText = await response.text();
      
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      
      // Parse CSV data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          // Parse CSV line (handle commas within quoted fields)
          const values = this.parseCSVLine(line);
          if (values.length < headers.length) continue;

          const entry: ECDictEntry = {
            word: values[0],
            phonetic: values[1] || undefined,
            definition: values[2] || undefined,
            translation: values[3] || undefined,
            pos: values[4] || undefined,
            collins: values[5] || undefined,
            oxford: values[6] || undefined,
            tag: values[7] || undefined,
            bnc: values[8] || undefined,
            frq: values[9] || undefined,
            exchange: values[10] || undefined,
            detail: values[11] || undefined,
            audio: values[12] || undefined,
          };

          // Store by lowercase word for case-insensitive lookup
          this.dictionary.set(entry.word.toLowerCase(), entry);
        } catch (error) {
          console.warn('Error parsing line:', line, error);
        }
      }

      this.loaded = true;
      console.log(`ECDICT loaded: ${this.dictionary.size} words`);
    } catch (error) {
      console.error('Failed to load ECDICT:', error);
      throw error;
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current);
    return result;
  }

  lookupWord(word: string): DictionaryEntry | null {
    const entry = this.dictionary.get(word.toLowerCase());
    if (!entry) return null;

    // Convert ECDICT entry to DictionaryEntry format
    const meanings = [];
    
    // Parse English definition if available
    if (entry.definition) {
      meanings.push({
        partOfSpeech: entry.pos || 'unknown',
        definition: entry.definition.replace(/\\n/g, ' ').trim(),
      });
    }

    return {
      phonetic: entry.phonetic ? `/${entry.phonetic}/` : undefined,
      meanings: meanings.length > 0 ? meanings : [{
        partOfSpeech: entry.pos || 'unknown',
        definition: 'No English definition available',
      }],
      chinese: entry.translation?.replace(/\\n/g, '\n').replace(/\\r/g, '').trim(),
    };
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getDictionarySize(): number {
    return this.dictionary.size;
  }
}

export const ecdictService = new ECDictService(); 
