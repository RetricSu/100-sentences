import React, { useState, useEffect } from "react";
import { useWrongWordBook } from "../hooks/useWrongWordBook";
import { WrongWordEntry } from "../types/dictation";
import { BaseLayout } from "../components/layout/BaseLayout";

export const WrongWordBookPage: React.FC = () => {
  const wrongWordBook = useWrongWordBook();
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showClearTextConfirm, setShowClearTextConfirm] = useState(false);

  // Handle Escape key to close confirmation dialogs
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowClearAllConfirm(false);
        setShowClearTextConfirm(false);
      }
    };

    if (showClearAllConfirm || showClearTextConfirm) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showClearAllConfirm, showClearTextConfirm]);

  const handleClearAll = () => {
    wrongWordBook.clearWrongWordBook();
    setSelectedTextId(null);
    setShowClearAllConfirm(false);
  };

  const handleClearSelectedText = () => {
    if (selectedTextId) {
      wrongWordBook.clearWrongWordsByText(selectedTextId);
      setSelectedTextId(null);
      setShowClearTextConfirm(false);
    }
  };

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
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Wrong Words Yet</h2>
          <p className="text-sm">
            Start practicing dictation to collect wrong words for review.
          </p>
        </div>
      </div>
    );
  }

  const selectedText = selectedTextId
    ? wrongWordBook.wrongWordBook[selectedTextId]
    : null;
  const selectedWrongWords = selectedText ? selectedText.entries : [];

  return (
    <BaseLayout>
      <div className="max-w-4xl mx-auto">
        {/* Text Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Select Text
            </h2>
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm"
              title="Remove all wrong words from the book"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {textIds.map((textId) => {
              const text = wrongWordBook.wrongWordBook[textId];
              return (
                <button
                  key={textId}
                  onClick={() => setSelectedTextId(textId)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedTextId === textId
                      ? "bg-orange-500 text-white border-orange-500 shadow-lg"
                      : "bg-white text-gray-700 border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{text.textTitle}</div>
                    <div className="text-sm opacity-75">
                      {text.entries.length} wrong words
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wrong Words List */}
        {selectedText && (
          <div className="bg-white rounded-xl border border-orange-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedText.textTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedWrongWords.length} wrong words to practice
                  </p>
                  {/* Statistics */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Set(selectedWrongWords.map(w => w.word.toLowerCase().trim())).size} unique words
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selectedWrongWords.length} total entries
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowClearTextConfirm(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm"
                  title="Remove all wrong words from this text"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear Text
                </button>
              </div>
            </div>

            <div className="divide-y divide-orange-100">
              {selectedWrongWords.map((entry) => (
                <WrongWordEntryItem
                  key={entry.id}
                  entry={entry}
                  textId={selectedTextId!}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clear All Wrong Words</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove ALL wrong words from your book? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Text Confirmation Dialog */}
      {showClearTextConfirm && selectedText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clear Text Wrong Words</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all wrong words from "{selectedText.textTitle}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearTextConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSelectedText}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear Text
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
};

// Individual wrong word entry component
const WrongWordEntryItem: React.FC<{
  entry: WrongWordEntry;
  textId: string;
}> = ({ entry, textId }) => {
  const wrongWordBook = useWrongWordBook();

  // Check if this word appears in multiple contexts
  const wordAppearances = Object.values(wrongWordBook.wrongWordBook).flatMap(text => 
    text.entries.filter(e => e.word.toLowerCase().trim() === entry.word.toLowerCase().trim())
  );
  const isMultiContext = wordAppearances.length > 1;

  const handleRemove = () => {
    if (confirm("Remove this word from your wrong word book?")) {
      wrongWordBook.removeWrongWord(textId, entry.id);
    }
  };

  return (
    <div className="p-6 hover:bg-orange-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-semibold text-gray-900 text-lg">
              {entry.word}
            </span>
            {isMultiContext && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                {wordAppearances.length} contexts
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
            <span className="font-medium">Contexts:</span>
            {entry.sentenceContext.map((context, index) => (
              <div key={index} className="mt-1 text-gray-700">
                "{context}"
              </div>
            ))}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Added: {entry.createdAt.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Practiced: {entry.practiceCount} times
            </span>
            {entry.lastPracticed && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Last: {entry.lastPracticed.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-6">
          <button
            onClick={handleRemove}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
