import React, { useState, useEffect } from 'react';
import { useAppStateContext } from '../contexts/AppStateContext';
import { useDictionaryContext } from '../contexts/DictionaryContext';
import { useSpeechContext } from '../contexts/SpeechContext';

export const DictionaryPopup: React.FC = () => {
  const appState = useAppStateContext();
  const dictionary = useDictionaryContext();
  const speech = useSpeechContext();
  
  // Get values from context
  const { currentWord: word, dictionaryVisible: isVisible, hideDictionary: onClose } = appState;

  const [englishData, setEnglishData] = useState<any>(null);
  const [chineseTranslation, setChineseTranslation] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Fetch English definitions when word changes
  useEffect(() => {
    if (word && isVisible) {
      fetchEnglishDefinitions(word);
    }
  }, [word, isVisible]);

  // Fetch Chinese translation when English data is available
  useEffect(() => {
    if (englishData && dictionary.dictionaryLoaded) {
      fetchChineseTranslation();
    }
  }, [englishData, dictionary.dictionaryLoaded]);

  const fetchEnglishDefinitions = async (targetWord: string) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${targetWord}`);
      
      if (response.ok) {
        const data = await response.json();
        const entry = data[0];
        
        const englishData = {
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
          meanings: entry.meanings.map((meaning: any) => ({
            partOfSpeech: meaning.partOfSpeech,
            definition: meaning.definitions[0]?.definition || 'No definition available',
            example: meaning.definitions[0]?.example,
          })),
        };
        
        setEnglishData(englishData);
        setChineseTranslation('');
        setTranslationError(null);
      } else {
        setEnglishData(null);
        setChineseTranslation('');
        setTranslationError('未找到英文释义');
      }
    } catch (err) {
      setEnglishData(null);
      setChineseTranslation('');
      setTranslationError('获取英文释义失败');
    }
  };

  const fetchChineseTranslation = async () => {
    if (!englishData || !dictionary.dictionaryLoaded) return;

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const result = await dictionary.lookupWord(word);
      if (result?.chinese) {
        setChineseTranslation(result.chinese);
      } else {
        setTranslationError('翻译失败');
      }
    } catch (err) {
      setTranslationError('翻译失败');
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white rounded-xl shadow-soft-xl border border-stone-200 p-6 max-w-md w-full mx-4 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
        >
          ×
        </button>

        {/* Content */}
        {!englishData && dictionary.loading && (
          <div className="text-emerald-500 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
            {dictionary.isLoading ? '下载翻译模型中...' : '查找中...'}
          </div>
        )}

        {translationError && !englishData && (
          <div className="text-rose-500 text-center py-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {translationError}
          </div>
        )}

        {englishData && (
          <div className="space-y-4">
            {/* Word title */}
            <div className="flex items-center justify-start gap-2 pb-3 border-b border-stone-100">
              <div className="text-2xl font-bold text-stone-800">{word}</div>
              <button
                onClick={() => speech.speak(word)}
                className="btn-primary p-2 text-sm"
                title="播放发音"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                </svg>
                发音
              </button>
            </div>

            {/* Phonetic */}
            {englishData.phonetic && (
              <div className="text-stone-600 italic text-sm">{englishData.phonetic}</div>
            )}

            {/* Chinese Translation - Featured prominently */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-amber-800">AI 中文翻译</div>
                <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                  AI 翻译
                </div>
              </div>
              
              {isTranslating ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mr-3"></div>
                  <span className="text-amber-700 text-sm">AI翻译中...</span>
                </div>
              ) : translationError ? (
                <div className="text-amber-700 text-sm py-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {translationError}
                  </div>
                </div>
              ) : chineseTranslation ? (
                <div className="text-base text-amber-900 leading-relaxed">
                  {chineseTranslation.split('\n').map((line: string, index: number) => (
                    <div key={index} className="mb-1">{line}</div>
                  ))}
                </div>
              ) : (
                <div className="text-amber-700 text-sm py-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    等待AI翻译...
                  </div>
                </div>
              )}
            </div>

            {/* English Meanings */}
            {englishData.meanings && englishData.meanings.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-stone-700">英文释义</h4>
                {englishData.meanings.map((meaning: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-emerald-600 text-sm">{meaning.partOfSpeech}</span>
                      <div className="flex-1">
                        <div className="text-stone-700 text-sm leading-relaxed">{meaning.definition}</div>
                        {meaning.example && (
                          <div className="text-stone-500 italic text-xs mt-1 ml-2">"{meaning.example}"</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Chinese translation note */}
            {!chineseTranslation && !isTranslating && !translationError && (
              <div className="text-xs text-stone-500 mt-4 p-3 bg-stone-50 rounded-lg text-center">
                💡 AI翻译模型准备中
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 
