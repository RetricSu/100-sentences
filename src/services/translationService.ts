import { pipeline, env, TranslationSingle } from '@xenova/transformers';

// Disable local models to ensure we use the online model
env.allowLocalModels = false;

export interface TranslationResult {
  translationText: string;
  confidence?: number;
  processingTime?: number;
}

export interface TranslationProgress {
  status: 'idle' | 'downloading' | 'loading' | 'translating' | 'completed' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

export interface TranslationServiceConfig {
  modelName?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Service for handling AI-powered translation using Xenova transformers
 * Provides model downloading, caching, and translation functionality
 */
export class TranslationService {
  private static instance: TranslationService;
  private generator: any = null;
  private isModelLoaded = false;
  private isDownloading = false;
  private downloadProgress = 0;
  private config: TranslationServiceConfig;

  private constructor(config: TranslationServiceConfig = {}) {
    this.config = {
      modelName: 'Xenova/opus-mt-en-zh',
      maxRetries: 3,
      timeout: 30000,
      ...config
    };
  }

  static getInstance(config?: TranslationServiceConfig): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService(config);
    }
    return TranslationService.instance;
  }

  /**
   * Initialize the translation model
   * Downloads the model if not already cached
   */
  async initializeModel(progressCallback?: (progress: TranslationProgress) => void): Promise<void> {
    if (this.isModelLoaded) {
      return;
    }

    if (this.isDownloading) {
      // Wait for existing download to complete
      while (this.isDownloading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      this.isDownloading = true;
      progressCallback?.({
        status: 'downloading',
        progress: 0,
        message: 'Downloading translation model...'
      });

      // Simulate download progress (actual progress tracking would require model-specific implementation)
      const progressInterval = setInterval(() => {
        this.downloadProgress += Math.random() * 10;
        if (this.downloadProgress > 90) this.downloadProgress = 90;
        
        progressCallback?.({
          status: 'downloading',
          progress: this.downloadProgress,
          message: 'Downloading translation model...'
        });
      }, 200);

      progressCallback?.({
        status: 'loading',
        message: 'Loading translation model...'
      });

      this.generator = await pipeline('translation', this.config.modelName!);
      
      clearInterval(progressInterval);
      this.isModelLoaded = true;
      this.isDownloading = false;
      this.downloadProgress = 0;

      progressCallback?.({
        status: 'completed',
        progress: 100,
        message: 'Model loaded successfully'
      });

    } catch (error) {
      this.isDownloading = false;
      this.downloadProgress = 0;
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load translation model';
      
      progressCallback?.({
        status: 'error',
        error: errorMessage
      });

      throw new Error(`Translation model initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Translate text from English to Chinese
   */
  async translate(
    text: string, 
    progressCallback?: (progress: TranslationProgress) => void
  ): Promise<TranslationResult> {
    if (!text.trim()) {
      throw new Error('Text to translate cannot be empty');
    }

    // Ensure model is loaded
    if (!this.isModelLoaded) {
      await this.initializeModel(progressCallback);
    }

    try {
      progressCallback?.({
        status: 'translating',
        message: 'Translating text...'
      });

      const startTime = Date.now();
      
      const result = await this.generator(text);
      const translationText = (result[0] as TranslationSingle).translation_text;
      
      const processingTime = Date.now() - startTime;

      progressCallback?.({
        status: 'completed',
        message: 'Translation completed'
      });

      return {
        translationText,
        processingTime
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      
      progressCallback?.({
        status: 'error',
        error: errorMessage
      });

      throw new Error(`Translation failed: ${errorMessage}`);
    }
  }

  /**
   * Check if the model is ready for translation
   */
  isReady(): boolean {
    return this.isModelLoaded && this.generator !== null;
  }

  /**
   * Get current download status
   */
  getDownloadStatus(): { isDownloading: boolean; progress: number } {
    return {
      isDownloading: this.isDownloading,
      progress: this.downloadProgress
    };
  }

  /**
   * Reset the service (useful for testing or error recovery)
   */
  reset(): void {
    this.generator = null;
    this.isModelLoaded = false;
    this.isDownloading = false;
    this.downloadProgress = 0;
  }
} 
