import React, { useState, useCallback } from "react";
import { SavedText } from "../hooks/useLocalStorage";

interface VoiceOption {
  voice: SpeechSynthesisVoice;
}

interface SettingsPanelProps {
  // Text processing callback - the main output of this component
  onTextUpdate: (text: string) => void;
  
  // Default text to use when input is empty
  defaultText?: string;
  
  // Current display text (for saving purposes)
  displayText: string;
  
  // Saved texts management
  savedTexts: SavedText[];
  savedTextsLoading: boolean;
  onLoadText: (savedText: SavedText) => void;
  onDeleteText: (id: string) => void;
  onClearAllTexts: () => void;
  onSaveText: (text: string, title?: string) => void;
  
  // Voice settings
  voices: VoiceOption[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  
  // Speed settings
  rate: number;
  onRateChange: (rate: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onTextUpdate,
  defaultText = "",
  displayText,
  savedTexts,
  savedTextsLoading,
  onLoadText,
  onDeleteText,
  onClearAllTexts,
  onSaveText,
  voices,
  selectedVoice,
  onVoiceChange,
  rate,
  onRateChange,
}) => {
  // Internal state management
  const [inputText, setInputText] = useState("");
  const [saveTextTitle, setSaveTextTitle] = useState("");
  const [showSavedTexts, setShowSavedTexts] = useState(false);

  // Handle text conversion
  const handleConvert = useCallback(() => {
    const textToProcess = inputText.trim() || defaultText;
    onTextUpdate(textToProcess);
  }, [inputText, defaultText, onTextUpdate]);

  // Handle text saving
  const handleSaveText = useCallback(() => {
    if (!displayText.trim()) return;
    
    const title = saveTextTitle.trim() || undefined;
    onSaveText(displayText, title);
    setSaveTextTitle("");
    
    // Show a brief success message
    alert("Text saved successfully!");
  }, [displayText, saveTextTitle, onSaveText]);

  // Handle loading saved text
  const handleLoadText = useCallback((savedText: SavedText) => {
    // Update internal input text to match loaded text
    setInputText(savedText.content);
    // Notify parent component
    onLoadText(savedText);
  }, [onLoadText]);

  // Handle voice selection
  const handleVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    if (index >= 0 && voices[index]) {
      onVoiceChange(voices[index].voice);
    }
  }, [voices, onVoiceChange]);

  // Handle rate change
  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onRateChange(parseFloat(e.target.value));
  }, [onRateChange]);

  // Toggle saved texts visibility
  const toggleSavedTexts = useCallback(() => {
    setShowSavedTexts(!showSavedTexts);
  }, [showSavedTexts]);

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-6">
      <h3 className="font-semibold text-gray-800 text-lg border-b border-gray-100 pb-2">
        Settings
      </h3>

      {/* Text Input Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Input Text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter English text or leave empty to use default..."
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleConvert}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
          >
            Update Text
          </button>
          <button
            onClick={handleSaveText}
            disabled={!displayText.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Save current text"
          >
            💾
          </button>
        </div>

        <input
          type="text"
          value={saveTextTitle}
          onChange={(e) => setSaveTextTitle(e.target.value)}
          placeholder="Optional: Enter title for saving..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
        />
      </div>

      {/* Saved Texts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Saved Texts ({savedTexts.length})
          </label>
          <button
            onClick={toggleSavedTexts}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {showSavedTexts ? "Hide" : "Show"}
          </button>
        </div>

        {showSavedTexts && (
          <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
            {savedTextsLoading ? (
              <div className="text-center text-gray-500 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm">Loading saved texts...</p>
              </div>
            ) : savedTexts.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">No saved texts yet</p>
                <p className="text-xs mt-1">Save your first text to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedTexts.map((savedText) => (
                  <SavedTextItem
                    key={savedText.id}
                    savedText={savedText}
                    onLoad={handleLoadText}
                    onDelete={onDeleteText}
                  />
                ))}

                {savedTexts.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={onClearAllTexts}
                      className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors font-medium"
                    >
                      Clear All Saved Texts
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
        <label className="block text-sm font-medium text-gray-700">
          Voice Selection
        </label>
        <select
          value={voices.findIndex((v) => v.voice === selectedVoice)}
          onChange={handleVoiceChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value={-1}>Select voice...</option>
          {voices.map((voiceOption, index) => (
            <option key={index} value={index}>
              {voiceOption.voice.name} ({voiceOption.voice.lang})
              {voiceOption.voice.localService ? " 📍" : " ☁️"}
            </option>
          ))}
        </select>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Reading Speed: {rate}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={handleRateChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.5x (Slow)</span>
          <span>1.0x (Normal)</span>
          <span>2.0x (Fast)</span>
        </div>
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
    <div className="bg-white p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate text-sm">
            {savedText.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {savedText.createdAt.toLocaleDateString()} at{" "}
            {savedText.createdAt.toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {savedText.content.substring(0, 100)}...
          </p>
        </div>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={handleLoad}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            title="Load this text"
          >
            📖
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Delete this text"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}; 
