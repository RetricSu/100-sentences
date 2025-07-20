import { useEffect } from "react";
import { useTextManagement } from "./hooks/useTextManagement";
import { useSpeechContext } from "./contexts/SpeechContext";
import { AppLayout } from "./components/AppLayout";

function App() {
  // Get speech from context
  const speech = useSpeechContext();

  // Text management for initialization
  const textManagement = useTextManagement();

  // Initialize with default text if no text is loaded
  useEffect(() => {
    if (!speech.originalText.trim() && textManagement.defaultText.trim()) {
      textManagement.handleTextUpdate(textManagement.defaultText);
    }
  }, [speech.originalText, textManagement]);

  if (!speech.isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">浏览器不支持</h1>
          <p className="text-gray-600 leading-relaxed">
            抱歉，您的浏览器不支持语音合成功能。请使用最新版本的 Chrome 或 Edge
            浏览器以获得最佳体验。
          </p>
        </div>
      </div>
    );
  }

  return <AppLayout />;
}

export default App;
