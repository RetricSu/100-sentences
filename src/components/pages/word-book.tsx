import React, { useState } from "react";
import { useWrongWordBook } from "../../hooks/useWrongWordBook";
import { WrongWordEntry } from "../../types/dictation";
import { BaseLayout } from "../layout/BaseLayout";

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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Select Text
          </h2>
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
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedText.textTitle}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedWrongWords.length} wrong words to practice
              </p>
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
    </BaseLayout>
  );
};

// Individual wrong word entry component
const WrongWordEntryItem: React.FC<{
  entry: WrongWordEntry;
  textId: string;
}> = ({ entry, textId }) => {
  const wrongWordBook = useWrongWordBook();

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
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-red-600 font-medium text-lg">
              {entry.userInput}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
            <span className="font-medium">Context:</span> "
            {entry.sentenceContext}"
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
