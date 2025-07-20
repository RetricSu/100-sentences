import React from 'react';
import { useAppStateContext } from '../contexts/AppStateContext';

interface DictionaryPopupProps {
  loading: boolean;
  error: string | null;
  onSpeak: (text: string) => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  loading,
  error,
  onSpeak,
}) => {
  const appState = useAppStateContext();
  
  // Get values from context
  const { currentWord: word, dictionaryData: data, dictionaryVisible: isVisible, hideDictionary: onClose } = appState;

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
        {loading && (
          <div className="text-sky-500 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-3"></div>
            查找中...
          </div>
        )}

        {error && (
          <div className="text-rose-500 text-center py-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Word title */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="text-2xl font-bold text-stone-800">{word}</div>
              <button
                onClick={() => onSpeak(word)}
                className="btn-primary p-2 text-sm"
                title="播放发音"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                </svg>
              </button>
            </div>

            {/* Phonetic */}
            {data.phonetic && (
              <div className="text-stone-600 italic text-sm">{data.phonetic}</div>
            )}

            {/* Chinese Translation - Featured prominently */}
            {data.chinese && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm font-medium text-amber-800 mb-2">中文翻译</div>
                <div className="text-base text-amber-900 leading-relaxed">
                  {data.chinese.split('\n').map((line: string, index: number) => (
                    <div key={index} className="mb-1">{line}</div>
                  ))}
                </div>
              </div>
            )}

            {/* English Meanings */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-700">英文释义</h4>
              {data.meanings.map((meaning: any, index: number) => (
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

            {/* No Chinese translation note */}
            {!data.chinese && (
              <div className="text-xs text-stone-500 mt-4 p-3 bg-stone-50 rounded-lg text-center">
                💡 该词汇暂无中文翻译
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 
