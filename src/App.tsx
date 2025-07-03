import React, { useState, useCallback, useEffect } from 'react';
import { useSpeech } from './hooks/useSpeech';
import { useDictionary } from './hooks/useDictionary';
import { DictionaryPopup } from './components/DictionaryPopup';
import { DictionaryEntry } from './types/index';

const defaultText = `The Dragon Boat Festival happens on the 5th day of the 5th lunar month, usually in June. Chinese people call it "Duan‑wu Jie." The holiday remembers a kind poet named Qu Yuan. When his country was lost, he jumped into a river in sadness.

People raced long wooden boats shaped like dragons to try to save him. Today the races are the most exciting part of the festival. Each boat has a drummer who beats a rhythm so the paddlers can row together.

Families also make and eat zongzi—sticky rice wrapped in bamboo leaves. Some put meat, peanuts, or red beans inside. Eating zongzi is said to keep bad luck away.`;

function App() {
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState(defaultText);
  const [processedHtml, setProcessedHtml] = useState('');
  
  // Dictionary popup state
  const [dictionaryVisible, setDictionaryVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry | null>(null);
  
  const {
    voices,
    selectedVoice,
    rate,
    isSupported,
    isSpeaking,
    setSelectedVoice,
    setRate,
    speak,
    speakAll,
    stop,
    testVoice,
  } = useSpeech();

  const {
    lookupWord,
    loading: dictionaryLoading,
    error: dictionaryError,
    dictionaryLoaded,
    dictionarySize,
  } = useDictionary();

  // Process text into clickable words
  const processText = useCallback((text: string) => {
    if (!text.trim()) return '';
    
    const paragraphs = text.trim().split(/\n\s*\n/);
    
    return paragraphs.map(paragraph => {
      const words = paragraph.trim().split(/\s+/);
      return words.map(word => `<span class="word cursor-pointer px-1 py-0.5 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200">${word}</span>`).join(' ');
    }).join('\n\n');
  }, []);

  // Convert text when button is clicked
  const handleConvert = useCallback(() => {
    const textToProcess = inputText.trim() || defaultText;
    setDisplayText(textToProcess);
    setProcessedHtml(processText(textToProcess));
  }, [inputText, processText]);

  // Handle word clicks
  const handleWordClick = useCallback(async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('word')) {
      const word = target.textContent?.replace(/[^A-Za-z']/g, '') || '';
      if (!word) return;
      
      speak(word);
      
      // Show popup immediately
      setCurrentWord(word);
      setDictionaryVisible(true);
      setDictionaryData(null);
      
      // Lookup word
      try {
        const result = await lookupWord(word);
        setDictionaryData(result);
      } catch (error) {
        console.error('Error looking up word:', error);
      }
    }
  }, [speak, lookupWord]);

  // Close dictionary popup
  const closeDictionary = useCallback(() => {
    setDictionaryVisible(false);
    setCurrentWord('');
    setDictionaryData(null);
  }, []);

  // Initialize processed text
  useEffect(() => {
    setProcessedHtml(processText(displayText));
  }, [displayText, processText]);

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">浏览器不支持</h1>
          <p className="text-gray-600 leading-relaxed">
            抱歉，您的浏览器不支持语音合成功能。请使用最新版本的 Chrome 或 Edge 浏览器以获得最佳体验。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Click-to-Read
          </h1>
          {dictionaryLoaded && (
            <div className="text-sm text-green-600">
              📖 {dictionarySize.toLocaleString()} 词汇
            </div>
          )}
          {!dictionaryLoaded && (
            <div className="text-sm text-orange-600">
              🔄 加载中...
            </div>
          )}
        </div>

        {/* Input Area */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入英文文本..."
          className="w-full h-24 p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm mb-3"
        />

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium mb-4"
        >
          转换文本
        </button>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <select
            value={voices.findIndex(v => v.voice === selectedVoice)}
            onChange={(e) => {
              const index = parseInt(e.target.value);
              if (index >= 0 && voices[index]) {
                setSelectedVoice(voices[index].voice);
              }
            }}
            className="sm:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={-1}>选择语音...</option>
            {voices.map((voiceOption, index) => (
              <option key={index} value={index}>
                {voiceOption.voice.name} ({voiceOption.voice.lang})
                {voiceOption.voice.localService ? ' 📍' : ' ☁️'}
              </option>
            ))}
          </select>
          
          <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 min-w-12 text-center font-medium">
              {rate}x
            </span>
          </div>
        </div>

        {/* Speech Control */}
        <button
          onClick={() => isSpeaking ? stop() : speakAll(displayText)}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 mb-4 focus:outline-none focus:ring-2 ${
            isSpeaking 
              ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' 
              : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
          }`}
        >
          {isSpeaking ? '⏸️ 停止朗读' : '▶️ 全文朗读'}
        </button>

        {/* Display Area */}
        <div className="min-h-32 p-4 bg-white rounded-lg border border-gray-200">
          <div
            onClick={handleWordClick}
            dangerouslySetInnerHTML={{
              __html: processedHtml.split('\n\n').map(p => `<p class="mb-4 last:mb-0">${p}</p>`).join('')
            }}
            className="text-base leading-relaxed text-gray-800"
          />
        </div>

        {/* Dictionary Popup */}
        <DictionaryPopup
          word={currentWord}
          data={dictionaryData}
          loading={dictionaryLoading}
          error={dictionaryError}
          isVisible={dictionaryVisible}
          onClose={closeDictionary}
        />
      </div>
    </div>
  );
}

export default App;
