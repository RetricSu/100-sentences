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
      return words.map(word => `<span class="word cursor-pointer px-1 py-0.5 rounded hover:bg-yellow-200">${word}</span>`).join(' ');
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">浏览器不支持</h1>
          <p className="text-gray-600">抱歉，您的浏览器不支持 SpeechSynthesis。请使用最新的 Chrome 或 Edge 浏览器。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-prose mx-auto px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Click-to-Read English Text</h1>
          {dictionaryLoaded && (
            <p className="text-sm text-green-600">
              📖 Chinese dictionary loaded ({dictionarySize.toLocaleString()} words)
            </p>
          )}
          {!dictionaryLoaded && (
            <p className="text-sm text-orange-600">
              🔄 Loading dictionary...
            </p>
          )}
        </div>

        {/* Input Area */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="请在这里输入英文文本，然后点击转换按钮..."
          className="w-full h-32 mb-5 p-3 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Controls Row 1 */}
        <div className="flex flex-wrap gap-3 items-center mb-5">
          <select
            value={voices.findIndex(v => v.voice === selectedVoice)}
            onChange={(e) => {
              const index = parseInt(e.target.value);
              if (index >= 0 && voices[index]) {
                setSelectedVoice(voices[index].voice);
              }
            }}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={-1}>选择语音...</option>
            {voices.map((voiceOption, index) => (
              <option key={index} value={index}>
                {voiceOption.voice.name} ({voiceOption.voice.lang})
                {voiceOption.voice.localService ? ' 📍' : ' ☁️'}
              </option>
            ))}
          </select>
          
          <button
            onClick={testVoice}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            测试语音
          </button>
          
          <button
            onClick={handleConvert}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            转换文本
          </button>
        </div>

        {/* Controls Row 2 */}
        <div className="flex flex-wrap gap-3 items-center mb-5">
          <button
            onClick={() => speakAll(displayText)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            全文朗读
          </button>
          
          <button
            onClick={stop}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            停止朗读
          </button>
          
          <div className="flex items-center gap-2">
            <label className="text-sm">语速:</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 min-w-8">{rate}x</span>
          </div>
        </div>

        {/* Display Area */}
        <div className="min-h-24 border border-gray-300 p-4 rounded bg-gray-50">
          <div
            onClick={handleWordClick}
            dangerouslySetInnerHTML={{
              __html: processedHtml.split('\n\n').map(p => `<p class="mb-4 last:mb-0">${p}</p>`).join('')
            }}
            className="text-base leading-relaxed"
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
