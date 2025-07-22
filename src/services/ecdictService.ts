import { DictionaryEntry, ECDictEntry } from '../types/index';
import { extractCleanWord } from '../utils/textProcessing';

class ECDictService {
  private dictionary: Map<string, ECDictEntry> = new Map();
  private loaded = false;
  private loading = false;
  private loadingProgress = 0;
  private loadingCallbacks: Array<(progress: number) => void> = [];

  async loadDictionary(onProgress?: (progress: number) => void): Promise<void> {
    if (this.loaded) return;
    
    if (this.loading) {
      // If already loading, just add the progress callback
      if (onProgress) {
        this.loadingCallbacks.push(onProgress);
      }
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.loaded) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loading = true;
    if (onProgress) {
      this.loadingCallbacks.push(onProgress);
    }

    try {
      // Try to load from cache first
      const cachedData = await this.loadFromCache();
      if (cachedData) {
        this.dictionary = cachedData;
        this.loaded = true;
        this.loading = false;
        this.notifyProgress(100);
        console.log(`ECDICT loaded from cache: ${this.dictionary.size} words`);
        return;
      }

      // Load from CSV file
      await this.loadFromCSV();
      
      // Cache the loaded data
      await this.saveToCache(this.dictionary);
      
      this.loaded = true;
      this.loading = false;
      this.notifyProgress(100);
      console.log(`ECDICT loaded: ${this.dictionary.size} words`);
    } catch (error) {
      this.loading = false;
      console.error('Failed to load ECDICT:', error);
      throw error;
    }
  }

  private async loadFromCSV(): Promise<void> {
    // Use the full dictionary file
    const response = await fetch('/ecdict.csv');
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const contentLength = response.headers.get('content-length');
    const totalSize = contentLength ? parseInt(contentLength) : 0;
    
    let receivedSize = 0;
    let csvText = '';
    
    // Read the response in chunks
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      receivedSize += value.length;
      csvText += new TextDecoder().decode(value);
      
      // Update download progress (0-50% for download, 50-100% for parsing)
      const downloadProgress = totalSize > 0 ? (receivedSize / totalSize) * 50 : 0;
      this.notifyProgress(downloadProgress);
    }
    
    // Parse CSV in chunks to avoid blocking the main thread
    await this.parseCSVInChunks(csvText);
  }

  private async parseCSVInChunks(csvText: string): Promise<void> {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const totalLines = lines.length - 1;
    const chunkSize = 1000; // Process 1000 lines at a time
    
    for (let i = 1; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize);
      
      // Process chunk
      for (const line of chunk) {
        if (!line.trim()) continue;
        
        try {
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

          this.dictionary.set(entry.word.toLowerCase(), entry);
        } catch (error) {
          // Skip invalid lines
        }
      }
      
      // Update parsing progress (50-100%)
      const parseProgress = 50 + (i / totalLines) * 50;
      this.notifyProgress(parseProgress);
      
      // Yield control to avoid blocking the main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  private notifyProgress(progress: number): void {
    this.loadingProgress = progress;
    this.loadingCallbacks.forEach(callback => callback(progress));
  }

  private async loadFromCache(): Promise<Map<string, ECDictEntry> | null> {
    try {
      if (!('indexedDB' in window)) return null;
      
      const db = await this.openDatabase();
      const transaction = db.transaction(['dictionary'], 'readonly');
      const store = transaction.objectStore('dictionary');
      const request = store.get('ecdict_data');
      
      return new Promise((resolve, _reject) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.data && result.version === this.getCacheVersion()) {
            const map = new Map<string, ECDictEntry>();
            for (const [key, value] of result.data) {
              map.set(key, value);
            }
            resolve(map);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('Failed to load from cache:', error);
      return null;
    }
  }

  private async saveToCache(dictionary: Map<string, ECDictEntry>): Promise<void> {
    try {
      if (!('indexedDB' in window)) return;
      
      const db = await this.openDatabase();
      const transaction = db.transaction(['dictionary'], 'readwrite');
      const store = transaction.objectStore('dictionary');
      
      // Convert Map to array for storage
      const data = Array.from(dictionary.entries());
      
      store.put({
        id: 'ecdict_data',
        data: data,
        version: this.getCacheVersion(),
        timestamp: Date.now()
      });
      
      console.log('Dictionary cached successfully');
    } catch (error) {
      console.warn('Failed to cache dictionary:', error);
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ECDictCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('dictionary')) {
          db.createObjectStore('dictionary', { keyPath: 'id' });
        }
      };
    });
  }

  private getCacheVersion(): string {
    // Change this when the dictionary format changes
    return 'v1.0';
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
    const cleanWord = extractCleanWord(word).toLowerCase();
    const entry = this.dictionary.get(cleanWord);
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

  isLoading(): boolean {
    return this.loading;
  }

  getLoadingProgress(): number {
    return this.loadingProgress;
  }

  getDictionarySize(): number {
    return this.dictionary.size;
  }
}

export const ecdictService = new ECDictService();
