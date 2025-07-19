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
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onTextUpdate,
  defaultText = "",
  displayText,
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
  const [selectedVoice, setSelectedVoice] = React.useState<SpeechSynthesisVoice | null>(null);

  // Load voices and sync with saved voice info
  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices
        .filter(voice => voice.lang.startsWith('en'))
        .map((voice, index) => ({ voice, index }));
      
      setVoices(englishVoices);

      // Try to restore saved voice
      if (selectedVoiceInfo) {
        const savedVoice = englishVoices.find(v => 
          v.voice.name === selectedVoiceInfo.name && v.voice.lang === selectedVoiceInfo.lang
        )?.voice;
        if (savedVoice) {
          setSelectedVoice(savedVoice);
          return;
        }
      }

      // Auto-select best voice if no saved voice
      const bestVoice = englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.name.includes('Microsoft')
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.name.includes('David')
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.name.includes('Zira')
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang === 'en-US' && v.voice.localService
      )?.voice ||
      englishVoices.find(v => 
        v.voice.lang.startsWith('en') && v.voice.localService
      )?.voice ||
      englishVoices[0]?.voice;

      if (bestVoice) {
        setSelectedVoice(bestVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceInfo]);

  // Handle voice selection change
  const handleVoiceSelectChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    if (index >= 0 && voices[index]) {
      const voice = voices[index].voice;
      setSelectedVoice(voice);
      handleVoiceChange(voice);
    }
  }, [voices, handleVoiceChange]);

  // Handle rate slider change
  const handleRateSliderChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    handleRateChange(newRate);
  }, [handleRateChange]);

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-6">
      <h3 className="font-semibold text-gray-800 text-lg border-b border-gray-100 pb-2">
        设置      
      </h3>

      {/* Text Input Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          输入文本
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入英文文本或留空使用默认文本"
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleConvert}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
          >
            更新文本
          </button>
          <button
            onClick={handleSaveText}
            disabled={!displayText.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
        />
      </div>

      {/* Saved Texts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            已保存文本 ({savedTexts.length})
          </label>
          <button
            onClick={toggleSavedTexts}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {showSavedTexts ? "隐藏" : "展开"}
          </button>
        </div>

        {showSavedTexts && (
          <div className="bg-stone-50 rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-thin">
            {savedTextsLoading ? (
              <div className="text-center text-stone-500 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mx-auto"></div>
                <p className="mt-2 text-sm">正在加载...</p>
              </div>
            ) : savedTexts.length === 0 ? (
              <div className="text-center text-stone-500 py-4">
                <p className="text-sm">暂无保存文本</p>
                <p className="text-xs mt-1 text-stone-400">保存您的第一个文本开始使用</p>
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
          value={voices.findIndex((v) => v.voice === selectedVoice)}
          onChange={handleVoiceSelectChange}
          className="input-primary text-sm"
        >
          <option value={-1}>选择语音...</option>
          {voices.map((voiceOption, index) => (
            <option key={index} value={index}>
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
        
        <p className="text-xs text-stone-500">
          这将清除所有句子的默写输入记录
        </p>
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
          <h4 className="font-medium text-stone-900 truncate text-sm"
          >
            {savedText.title}
          </h4>
          <p className="text-xs text-stone-500 mt-1"
          >
            {savedText.createdAt.toLocaleDateString()} {savedText.createdAt.toLocaleTimeString()}
          </p>
          <p className="text-xs text-stone-600 mt-1 line-clamp-2"
          >
            {savedText.content.substring(0, 100)}...
          </p>
        </div>
        <div className="flex space-x-1 ml-2 flex-shrink-0">
          <button
            onClick={handleLoad}
            className="p-1.5 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
            title="加载此文本"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
            title="删除此文本"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 
