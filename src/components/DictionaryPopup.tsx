import React from 'react';
import { DictionaryEntry } from '../types/index';

interface DictionaryPopupProps {
  word: string;
  data: DictionaryEntry | null;
  loading: boolean;
  error: string | null;
  isVisible: boolean;
  onClose: () => void;
  onSpeak: (text: string) => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  word,
  data,
  loading,
  error,
  isVisible,
  onClose,
  onSpeak,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white border-2 border-blue-500 rounded-lg p-6 shadow-lg max-w-md w-full mx-4 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>

        {/* Content */}
        {loading && (
          <div className="text-blue-500 text-center py-4">
            查找中...
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center py-4">
            {error}
          </div>
        )}

        {data && (
          <div>
            {/* Word title */}
            <div className="text-xl font-bold text-blue-500 mb-2 border-b border-gray-200 pb-2">
              {word}
            </div>

            {/* Phonetic with play button */}
            {data.phonetic && (
              <div className="flex items-center gap-2 mb-3">
                <div className="text-gray-600 italic">
                  {data.phonetic}
                </div>
                <button
                  onClick={() => onSpeak(word)}
                  className="flex items-center justify-center w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200"
                  title="Play pronunciation"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Chinese Translation - Featured prominently */}
            {data.chinese && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-700 font-medium mb-1">中文翻译</div>
                <div className="text-lg text-yellow-900 font-medium leading-relaxed">
                  {data.chinese.split('\n').map((line, index) => (
                    <div key={index} className="mb-1">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* English Meanings */}
            <div className="mb-2">
              <div className="text-sm text-gray-600 font-medium mb-2">English Definition</div>
              {data.meanings.map((meaning, index) => (
                <div key={index} className="mb-3">
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="font-bold text-orange-500 text-sm">
                      {meaning.partOfSpeech}
                    </span>
                    <div className="flex-1">
                      <div className="text-gray-800 text-sm leading-relaxed">
                        {meaning.definition}
                      </div>
                      {meaning.example && (
                        <div className="text-gray-600 italic text-xs mt-1 ml-3">
                          "{meaning.example}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Chinese translation note */}
            {!data.chinese && (
              <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                💡 Chinese translation not available for this word
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 
