import { useState, useEffect } from 'react';
import { usePWAInstall, useNetworkStatus } from '../../utils/pwa';
import { X, Download, Wifi, WifiOff } from 'lucide-react';

export default function PWAInstallPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const { isOnline } = useNetworkStatus();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show install prompt after 30 seconds if installable
    if (isInstallable && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowPrompt(false);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt || dismissed) return null;

  return (
    <>
      {/* Install Prompt */}
      {isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Install FinanceFlow
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get the full experience with offline access
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 z-50">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                You're offline
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                App will sync when connection is restored
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Online Status (when back online) */}
      {isOnline && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 z-50 animate-fade-in">
          <div className="flex items-center space-x-3">
            <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Back online
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Syncing your data...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
