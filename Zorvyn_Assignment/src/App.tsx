import { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/common/Navbar';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import { useStore } from './store/useStore';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Insights = lazy(() => import('./pages/Insights'));

type Page = 'dashboard' | 'transactions' | 'insights';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { setDarkMode } = useStore();

  // Initialize dark mode only on first mount
  useEffect(() => {
    // Check if dark mode is already set in Zustand persist storage
    const persistStorage = localStorage.getItem('finance-dashboard');
    if (persistStorage) {
      try {
        const parsed = JSON.parse(persistStorage);
        if (parsed.state?.darkMode !== undefined) {
          // Use persisted value - don't override
          return;
        }
      } catch (e) {
        console.log('Failed to parse persist storage');
      }
    }
    
    // If no persisted value, initialize from system preference only
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []); // Empty dependency array - run only once

  const renderPage = () => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        {(() => {
          switch (currentPage) {
            case 'dashboard':
              return <Dashboard />;
            case 'transactions':
              return <Transactions />;
            case 'insights':
              return <Insights />;
            default:
              return <Dashboard />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar onPageChange={setCurrentPage} currentPage={currentPage} />
      <main className="animate-fade-in">
        {renderPage()}
      </main>
      <PWAInstallPrompt />
    </div>
  );
}

export default App;