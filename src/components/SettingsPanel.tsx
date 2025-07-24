import React from "react";
import { SavedText } from "../hooks/useLocalStorage";
import { useSettingsPanel } from "../hooks/useSettingsPanel";

interface VoiceOption {
  voice: SpeechSynthesisVoice;
}

interface SettingsPanelProps {
  // Core functionality - the main output
  onTextUpdate: (text: string) => void;

  // Optional default text
  defaultText?: string;

  // Current display text (for saving)
  displayText: string;

  // Close function
  onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onTextUpdate,
  defaultText = "",
  displayText,
  onClose,
}) => {
  // Use the internalized settings management hook
  const {
    // Internal state
    inputText,
    setInputText,
    saveTextTitle,
    setSaveTextTitle,
    showSavedTexts,

    // Saved texts
    savedTexts,
    savedTextsLoading,

    // Voice and rate settings
    selectedVoiceInfo,
    rate,

    // Actions
    handleConvert,
    handleSaveText,
    handleLoadText,
    handleVoiceChange,
    handleRateChange,
    toggleSavedTexts,
    handleClearDictationInputs,
    deleteText,
    clearAllTexts,
  } = useSettingsPanel({ onTextUpdate, defaultText, displayText });

  // Get available voices from the browser
  const [voices, setVoices] = React.useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] =
    React.useState<SpeechSynthesisVoice | null>(null);

  // Load voices and sync with saved voice info
  React.useEffect(() => {
    let isSubscribed = true;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices
        .filter((voice) => voice.lang.startsWith("en"))
        .map((voice, index) => ({ voice, index }));

      // Only update if we have voices and they actually changed
      if (englishVoices.length > 0) {
        setVoices((prevVoices) => {
          // Prevent unnecessary re-renders if voices haven't actually changed
          if (prevVoices.length === englishVoices.length) {
            const voicesMatch = prevVoices.every(
              (prev, index) =>
                prev.voice.name === englishVoices[index].voice.name &&
                prev.voice.lang === englishVoices[index].voice.lang,
            );
            if (voicesMatch) return prevVoices;
          }
          return englishVoices;
        });

        if (!isSubscribed) return;

        // Try to restore saved voice - but only once when voices are stable
        if (selectedVoiceInfo) {
          const savedVoice = englishVoices.find(
            (v) =>
              v.voice.name === selectedVoiceInfo.name &&
              v.voice.lang === selectedVoiceInfo.lang,
          )?.voice;
          if (savedVoice) {
            setSelectedVoice(savedVoice);
            return;
          }
        }

        // Auto-select best voice only if none is selected or it becomes invalid
        if (
          !selectedVoice ||
          !englishVoices.find((v) => v.voice === selectedVoice)
        ) {
          const bestVoice =
            englishVoices.find(
              (v) =>
                v.voice.lang === "en-US" && v.voice.name.includes("Microsoft"),
            )?.voice ||
            englishVoices.find(
              (v) => v.voice.lang === "en-US" && v.voice.name.includes("David"),
            )?.voice ||
            englishVoices.find(
              (v) => v.voice.lang === "en-US" && v.voice.name.includes("Zira"),
            )?.voice ||
            englishVoices.find(
              (v) => v.voice.lang === "en-US" && v.voice.localService,
            )?.voice ||
            englishVoices.find(
              (v) => v.voice.lang.startsWith("en") && v.voice.localService,
            )?.voice ||
            englishVoices[0]?.voice;

          if (bestVoice && isSubscribed) {
            setSelectedVoice(bestVoice);
          }
        }
      }
    };

    // Small delay to prevent rapid-fire events from causing flicker
    const debouncedLoadVoices = () => {
      setTimeout(loadVoices, 100);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = debouncedLoadVoices;

    return () => {
      isSubscribed = false;
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceInfo]);

  // Handle voice selection change
  const handleVoiceSelectChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const index = parseInt(e.target.value);
      if (index >= 0 && index < voices.length && voices[index]) {
        const voice = voices[index].voice;
        setSelectedVoice(voice);
        handleVoiceChange(voice);
      }
    },
    [voices, handleVoiceChange],
  );

  // Handle rate slider change
  const handleRateSliderChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newRate = parseFloat(e.target.value);
      handleRateChange(newRate);
    },
    [handleRateChange],
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <h3 className="font-semibold text-stone-800 text-lg">设置</h3>
        <button
          onClick={onClose}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          title="关闭设置"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Show word book page */}
      <div>
        <a
          className="px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
          href="/wrong-words"
          target="_blank"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          打开错词本
        </a>
      </div>

      {/* Text Input Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          输入文本
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入英文文本或留空使用默认文本"
          className="w-full h-24 p-3 border border-stone-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
        />

        <div className="flex gap-2">
          <button
            onClick={handleConvert}
            className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors font-medium"
          >
            更新文本
          </button>
          <button
            onClick={handleSaveText}
            disabled={!displayText.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors font-medium disabled:bg-stone-400 disabled:cursor-not-allowed"
            title="Save current text"
          >
            💾 保存
          </button>
        </div>

        <input
          type="text"
          value={saveTextTitle}
          onChange={(e) => setSaveTextTitle(e.target.value)}
          placeholder="可选: 输入保存标题"
          className="w-full p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
        />
      </div>

      {/* Saved Texts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-stone-700">
            已保存文本 ({savedTexts.length})
          </label>
          <button
            onClick={toggleSavedTexts}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
          >
            {showSavedTexts ? "隐藏" : "展开"}
          </button>
        </div>

        {showSavedTexts && (
          <div className="bg-stone-50 rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-thin">
            {savedTextsLoading ? (
              <div className="text-center text-stone-500 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="mt-2 text-sm">正在加载...</p>
              </div>
            ) : savedTexts.length === 0 ? (
              <div className="text-center text-stone-500 py-4">
                <p className="text-sm">暂无保存文本</p>
                <p className="text-xs mt-1 text-stone-400">
                  保存您的第一个文本开始使用
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedTexts.map((savedText) => (
                  <SavedTextItem
                    key={savedText.id}
                    savedText={savedText}
                    onLoad={handleLoadText}
                    onDelete={deleteText}
                  />
                ))}

                {savedTexts.length > 0 && (
                  <div className="pt-3 border-t border-stone-200">
                    <button
                      onClick={clearAllTexts}
                      className="w-full btn-secondary text-sm text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      清空所有保存
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          语音选择
        </label>
        <select
          value={
            selectedVoice
              ? voices.findIndex(
                  (v) =>
                    v.voice.name === selectedVoice.name &&
                    v.voice.lang === selectedVoice.lang,
                )
              : -1
          }
          onChange={handleVoiceSelectChange}
          className="input-primary text-sm"
          disabled={voices.length === 0}
        >
          <option value={-1}>选择语音...</option>
          {voices.map((voiceOption, index) => (
            <option
              key={`${voiceOption.voice.name}-${voiceOption.voice.lang}-${index}`}
              value={index}
            >
              {voiceOption.voice.name} ({voiceOption.voice.lang})
              {voiceOption.voice.localService ? " 本地" : " 在线"}
            </option>
          ))}
        </select>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          朗读速度: {rate}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={handleRateSliderChange}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-stone-500">
          <span>0.5x (慢)</span>
          <span>1.0x (正常)</span>
          <span>2.0x (快)</span>
        </div>
      </div>

      {/* Dictation Management Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          默写管理
        </label>

        <button
          onClick={handleClearDictationInputs}
          className="w-full btn-secondary text-sm text-amber-600 border-amber-200 hover:bg-amber-50"
          title="清除所有默写进度"
        >
          清除默写进度
        </button>

        <p className="text-xs text-stone-500">这将清除所有句子的默写输入记录</p>
      </div>
    </div>
  );
};

// Separate component for saved text items for better organization
interface SavedTextItemProps {
  savedText: SavedText;
  onLoad: (savedText: SavedText) => void;
  onDelete: (id: string) => void;
}

const SavedTextItem: React.FC<SavedTextItemProps> = ({
  savedText,
  onLoad,
  onDelete,
}) => {
  const handleLoad = () => onLoad(savedText);
  const handleDelete = () => onDelete(savedText.id);

  return (
    <div className="bg-white p-3 rounded-lg border border-stone-200 hover:border-stone-300 transition-colors shadow-soft">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-stone-900 truncate text-sm">
            {savedText.title}
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            {savedText.createdAt.toLocaleDateString()}{" "}
            {savedText.createdAt.toLocaleTimeString()}
          </p>
          <p className="text-xs text-stone-600 mt-1 line-clamp-2">
            {savedText.content.substring(0, 100)}...
          </p>
        </div>
        <div className="flex space-x-1 ml-2 flex-shrink-0">
          <button
            onClick={handleLoad}
            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
            title="加载此文本"
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
            title="删除此文本"
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
          </button>
        </div>
      </div>
    </div>
  );
};
