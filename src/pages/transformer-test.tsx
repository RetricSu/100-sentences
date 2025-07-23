import React, { useState } from 'react';
import { BaseLayout } from '../components/layout/BaseLayout';
import { useTranslationContext } from '../contexts/TranslationContext';

const TransformerTestPage: React.FC = () => {
  const [inputText, setInputText] = useState('Hello world');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translation = useTranslationContext();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      console.log('Starting translation...');
      
      const result = await translation.translate(inputText);
      
      console.log('Translation result:', result);
      
      setOutputText(result.translationText);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-6">AI Translation Test</h1>
          
          <div className="space-y-6">
            {/* Model Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Translation Model Status</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {translation.isReady ? 'Model ready' : 'Model not ready'}
                  </p>
                </div>
                <div className="text-right">
                  {translation.isDownloading && (
                    <div className="text-sm text-blue-600">
                      Downloading: {Math.round(translation.downloadProgress)}%
                    </div>
                  )}
                  {translation.isTranslating && (
                    <div className="text-sm text-blue-600">Translating...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div>
              <label htmlFor="input-text" className="block text-sm font-medium text-stone-700 mb-2">
                Input Text (English to Chinese)
              </label>
              <textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter English text to translate to Chinese..."
              />
            </div>

            {/* Translate Button */}
            <div>
              <button
                onClick={handleTranslate}
                disabled={isLoading || !translation.isReady}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating...
                  </>
                ) : (
                  'Translate to Chinese'
                )}
              </button>
            </div>

            {/* Error Display */}
            {(error || translation.error) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error || translation.error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Output Section */}
            {outputText && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Translation Result
                </label>
                <div className="w-full h-32 px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg overflow-auto">
                  <p className="text-stone-800 whitespace-pre-wrap">{outputText}</p>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">AI Translation</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>This page tests the AI-powered translation service using the Xenova/opus-mt-en-zh model.</p>
                    <p className="mt-1">The model will be downloaded on first use and cached for future translations.</p>
                    <p className="mt-1">This replaces the large 300MB dictionary file with a more efficient AI solution.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default TransformerTestPage; 
