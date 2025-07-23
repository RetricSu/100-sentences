import React from 'react';
import { useTranslationContext } from '../../contexts/TranslationContext';

interface AppInitializationModalProps {
  isVisible: boolean;
}

export const AppInitializationModal: React.FC<AppInitializationModalProps> = ({
  isVisible
}) => {
  const { 
    isDownloading, 
    downloadProgress, 
    error, 
    progress,
    isReady 
  } = useTranslationContext();

  if (!isVisible || isReady) return null;

  const getStatusMessage = () => {
    if (error) return 'AI模型下载失败';
    if (progress?.status === 'completed') return 'AI模型已就绪！';
    if (progress?.status === 'translating') return '测试翻译功能...';
    if (progress?.status === 'loading') return '加载AI模型...';
    return '下载AI翻译模型...';
  };

  const getStatusIcon = () => {
    if (error) {
      return (
        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (progress?.status === 'completed') {
      return (
        <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    return (
      <svg className="h-12 w-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            百句斩
          </h2>
          <p className="text-stone-600">
            正在初始化AI翻译功能
          </p>
        </div>

        {/* Status Display */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <p className="text-lg font-medium text-stone-800 mb-2">
            {getStatusMessage()}
          </p>
          {progress?.message && (
            <p className="text-sm text-stone-600">{progress.message}</p>
          )}
        </div>

        {/* Progress Bar */}
        {isDownloading && !error && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-stone-600 mb-2">
              <span>下载进度</span>
              <span>{Math.round(downloadProgress)}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">下载失败</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI翻译功能</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>我们正在下载AI翻译模型，这将为您的英语学习提供更准确的翻译。</p>
                <p className="mt-1">模型下载完成后将缓存到浏览器，后续使用无需重新下载。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
