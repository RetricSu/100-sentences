import React, { useState, useEffect } from "react";
import { useWrongWordBook } from "../hooks/useWrongWordBook";
import { WrongWordEntry } from "../types/dictation";
import { BaseLayout } from "../components/layout/BaseLayout";
import { useAppStateContext } from "../contexts/AppStateContext";
import { useDictionaryContext } from "../contexts/DictionaryContext";
import { useNotification } from "../hooks/useNotification";
import { removeZeroWidthChars } from "../utils/textProcessing";

export const WrongWordBookPage: React.FC = () => {
  const wrongWordBook = useWrongWordBook();
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showClearTextConfirm, setShowClearTextConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'word' | 'practice'>('date');

  // Handle Escape key to close confirmation dialogs
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowClearAllConfirm(false);
        setShowClearTextConfirm(false);
      }
    };

    if (showClearAllConfirm || showClearTextConfirm) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
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
      <BaseLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-stone-500">
            <p>Loading wrong word book...</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const textIds = Object.keys(wrongWordBook.wrongWordBook);

  if (textIds.length === 0) {
    return (
      <BaseLayout>
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
            <p className="text-sm">开始默写练习，收集错词。</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  // Get all wrong words across all texts
  const allWrongWords = Object.values(wrongWordBook.wrongWordBook).flatMap(
    (text) => text.entries.map(entry => ({ ...entry, textId: Object.keys(wrongWordBook.wrongWordBook).find(id => wrongWordBook.wrongWordBook[id] === text)! }))
  );

  // Sort words based on selected criteria
  const sortedWords = [...allWrongWords].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'word':
        return a.word.localeCompare(b.word);
      case 'practice':
        return (b.practiceCount || 0) - (a.practiceCount || 0);
      default:
        return 0;
    }
  });

  // Group words by text for filtering
  const wordsByText = selectedTextId 
    ? sortedWords.filter(word => word.textId === selectedTextId)
    : sortedWords;

  // Get unique word count
  const uniqueWords = new Set(wordsByText.map(w => w.word.toLowerCase().trim())).size;

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header with controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">错词本</h1>
              <p className="text-sm text-gray-600 mt-1">
                {wordsByText.length} 条 • {uniqueWords} 个单词
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="date">Sort by Date</option>
                <option value="word">Sort by Word</option>
                <option value="practice">Sort by Practice</option>
              </select>

              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                title="Remove all wrong words from the book"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          </div>

          {/* Text filter tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTextId(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTextId === null
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              所有文本 ({allWrongWords.length})
            </button>
            {textIds.map((textId) => {
              const text = wrongWordBook.wrongWordBook[textId];
              const wordCount = allWrongWords.filter(w => w.textId === textId).length;
              return (
                <button
                  key={textId}
                  onClick={() => setSelectedTextId(textId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTextId === textId
                      ? "bg-orange-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {text.textTitle} ({wordCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Words Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wordsByText.map((entry) => (
              <CompactWordCard
                key={entry.id}
                entry={entry}
                textId={entry.textId}
                allWords={allWrongWords}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {wordsByText.map((entry) => (
              <CompactWordListItem
                key={entry.id}
                entry={entry}
                textId={entry.textId}
                allWords={allWrongWords}
              />
            ))}
          </div>
        )}

        {/* Empty state for filtered view */}
        {wordsByText.length === 0 && selectedTextId && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No wrong words in this text</h3>
            <p className="text-sm text-gray-500">Try selecting a different text or practice more dictation.</p>
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
      {showClearTextConfirm && selectedTextId && (
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
              Are you sure you want to remove all wrong words from "{wrongWordBook.wrongWordBook[selectedTextId]?.textTitle}"? This action cannot be undone.
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

// Compact card component for grid view
const CompactWordCard: React.FC<{
  entry: WrongWordEntry & { textId: string };
  textId: string;
  allWords: (WrongWordEntry & { textId: string })[];
}> = ({ entry, textId, allWords }) => {
  const wrongWordBook = useWrongWordBook();
  const appState = useAppStateContext();
  const dictionary = useDictionaryContext();
  const notification = useNotification();

  // Check if this word appears in multiple contexts
  const wordAppearances = allWords.filter(
    (w) => w.word.toLowerCase().trim() === entry.word.toLowerCase().trim()
  );
  const isMultiContext = wordAppearances.length > 1;

  const handleRemove = () => {
    notification.warning('确认删除', `确定要从错词本中删除 "${entry.word}" 吗？`, {
      duration: 0,
      action: {
        label: '确认删除',
        onClick: () => {
          wrongWordBook.removeWrongWord(textId, entry.id);
          notification.success('删除成功', `已从错词本中删除 "${entry.word}"`);
        }
      }
    });
  };

  const handleDictionary = async () => {
    // Clean the word to remove any zero-width characters
    const cleanWord = removeZeroWidthChars(entry.word);
    appState.showDictionary(cleanWord);
    try {
      const result = await dictionary.lookupWord(cleanWord);
      appState.setDictionaryDataValue(result);
    } catch (error) {
      console.error("Error looking up word:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with word and actions */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-lg">{entry.word}</h3>
              {isMultiContext && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                  {wordAppearances.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleDictionary}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Look up in dictionary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
            <button
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove from book"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Context preview */}
      <div className="px-4">
        <div className="space-y-1">
          {entry.sentenceContext.slice(0, 2).map((context, index) => (
            <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              "{context.length > 60 ? context.substring(0, 60) + '...' : context}"
            </div>
          ))}
          {entry.sentenceContext.length > 2 && (
            <div className="text-xs text-gray-400">+{entry.sentenceContext.length - 2} more contexts</div>
          )}
        </div>
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
            {entry.practiceCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {entry.practiceCount}×
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact list item component
const CompactWordListItem: React.FC<{
  entry: WrongWordEntry & { textId: string };
  textId: string;
  allWords: (WrongWordEntry & { textId: string })[];
}> = ({ entry, textId, allWords }) => {
  const wrongWordBook = useWrongWordBook();
  const appState = useAppStateContext();
  const dictionary = useDictionaryContext();
  const notification = useNotification();

  const wordAppearances = allWords.filter(
    (w) => w.word.toLowerCase().trim() === entry.word.toLowerCase().trim()
  );
  const isMultiContext = wordAppearances.length > 1;

  const handleRemove = () => {
    notification.warning('确认删除', `确定要从错词本中删除 "${entry.word}" 吗？`, {
      duration: 0,
      action: {
        label: '确认删除',
        onClick: () => {
          wrongWordBook.removeWrongWord(textId, entry.id);
          notification.success('删除成功', `已从错词本中删除 "${entry.word}"`);
        }
      }
    });
  };

  const handleDictionary = async () => {
    // Clean the word to remove any zero-width characters
    const cleanWord = removeZeroWidthChars(entry.word);
    appState.showDictionary(cleanWord);
    try {
      const result = await dictionary.lookupWord(cleanWord);
      appState.setDictionaryDataValue(result);
    } catch (error) {
      console.error("Error looking up word:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{entry.word}</h3>
            {isMultiContext && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                {wordAppearances.length} contexts
              </span>
            )}
            <span className="text-xs text-gray-500">{entry.textTitle}</span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {entry.sentenceContext[0] && (
              <span className="italic">"{entry.sentenceContext[0].length > 80 ? entry.sentenceContext[0].substring(0, 80) + '...' : entry.sentenceContext[0]}"</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
            {entry.practiceCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Practiced {entry.practiceCount} times
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={handleDictionary}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            title="Look up in dictionary"
          >
            词典
          </button>
          <button
            onClick={handleRemove}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};
