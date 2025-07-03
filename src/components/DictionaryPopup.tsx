import React from 'react';
import { DictionaryEntry } from '../types/index';

interface DictionaryPopupProps {
  word: string;
  data: DictionaryEntry | null;
  loading: boolean;
  error: string | null;
  isVisible: boolean;
  onClose: () => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  word,
  data,
  loading,
  error,
  isVisible,
  onClose,
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

            {/* Phonetic */}
            {data.phonetic && (
              <div className="text-gray-600 italic mb-3">
                {data.phonetic}
              </div>
            )}

            {/* Meanings */}
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
        )}
      </div>
    </div>
  );
}; 
