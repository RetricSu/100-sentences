import React, { useEffect, useState } from 'react';
import { useTranslationContext } from '../../contexts/TranslationContext';

interface ModelDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModelDownloadModal: React.FC<ModelDownloadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    isDownloading, 
    downloadProgress, 
    error, 
    progress,
    initializeModel 
  } = useTranslationContext();

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setHasStarted(true);
      initializeModel().catch(() => {
        // Error is handled by the hook
      });
    }
  }, [isOpen, hasStarted, initializeModel]);

  useEffect(() => {
    if (progress?.status === 'completed') {
      setTimeout(() => {
        onSuccess();
        setHasStarted(false);
      }, 1000); // Small delay to show completion
    }
  }, [progress?.status, onSuccess]);

  if (!isOpen) return null;

  const getStatusMessage = () => {
    if (error) return 'Download failed';
    if (progress?.status === 'completed') return 'Model ready!';
    if (progress?.status === 'translating') return 'Testing translation...';
    if (progress?.status === 'loading') return 'Loading model...';
    return 'Downloading translation model...';
  };

  const getStatusIcon = () => {
    if (error) {
      return (
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (progress?.status === 'completed') {
      return (
        <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    return (
      <svg className="h-8 w-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Translation Model Setup
          </h2>
          <p className="text-stone-600">
            Downloading AI translation model for English to Chinese translation
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
              <span>Downloading...</span>
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
                <h3 className="text-sm font-medium text-red-800">Download Failed</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">What's happening?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>We're downloading a powerful AI translation model that will enable instant English to Chinese translation.</p>
                <p className="mt-1">This only happens once and the model will be cached for future use.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {error ? (
            <>
              <button
                onClick={() => {
                  setHasStarted(false);
                  onClose();
                }}
                className="flex-1 px-4 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setHasStarted(false);
                  initializeModel().catch(() => {
                    // Error is handled by the hook
                  });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </>
          ) : progress?.status === 'completed' ? (
            <button
              onClick={() => {
                setHasStarted(false);
                onSuccess();
              }}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={isDownloading}
              className="w-full px-4 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 
