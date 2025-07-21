import React, { useState } from 'react';
import { useWrongWordBook } from '../../hooks/useWrongWordBook';
import { WrongWordEntry } from '../../types/dictation';

export const WrongWordBookPage: React.FC = () => {
  const wrongWordBook = useWrongWordBook();
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  if (!wrongWordBook.isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <p>Loading wrong word book...</p>
        </div>
      </div>
    );
  }

  const textIds = Object.keys(wrongWordBook.wrongWordBook);

  if (textIds.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Wrong Words Yet</h2>
          <p className="text-sm">Start practicing dictation to collect wrong words for review.</p>
        </div>
      </div>
    );
  }

  const selectedText = selectedTextId ? wrongWordBook.wrongWordBook[selectedTextId] : null;
  const selectedWrongWords = selectedText ? selectedText.entries : [];

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Wrong Word Book</h1>
          <p className="text-gray-600">Review and practice words you got wrong during dictation.</p>
        </div>

        {/* Text Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Text</h2>
          <div className="flex flex-wrap gap-2">
            {textIds.map(textId => {
              const text = wrongWordBook.wrongWordBook[textId];
              return (
                <button
                  key={textId}
                  onClick={() => setSelectedTextId(textId)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedTextId === textId
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {text.textTitle} ({text.entries.length} words)
                </button>
              );
            })}
          </div>
        </div>

        {/* Wrong Words List */}
        {selectedText && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{selectedText.textTitle}</h3>
              <p className="text-sm text-gray-600">{selectedWrongWords.length} wrong words</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {selectedWrongWords.map((entry) => (
                <WrongWordEntryItem key={entry.id} entry={entry} textId={selectedTextId!} />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={wrongWordBook.clearWrongWordBook}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Clear All Wrong Words
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual wrong word entry component
const WrongWordEntryItem: React.FC<{ entry: WrongWordEntry; textId: string }> = ({ entry, textId }) => {
  const wrongWordBook = useWrongWordBook();

  const handlePractice = () => {
    wrongWordBook.updatePracticeCount(textId, entry.id);
  };

  const handleRemove = () => {
    if (confirm('Remove this word from your wrong word book?')) {
      wrongWordBook.removeWrongWord(textId, entry.id);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium text-gray-900">{entry.word}</span>
            <span className="text-gray-400">→</span>
            <span className="text-red-600">{entry.userInput}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            Context: "{entry.sentenceContext}"
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Added: {entry.createdAt.toLocaleDateString()}</span>
            <span>Practiced: {entry.practiceCount} times</span>
            {entry.lastPracticed && (
              <span>Last: {entry.lastPracticed.toLocaleDateString()}</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={handlePractice}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Practice
          </button>
          <button
            onClick={handleRemove}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}; 
