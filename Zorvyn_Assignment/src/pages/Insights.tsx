import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  AlertCircle,
  Brain
} from 'lucide-react';
import EnhancedAnalytics from '../components/analytics/EnhancedAnalytics';

const Insights: React.FC = () => {
  const { 
    transactions, 
    insights: apiInsights, 
    loading, 
    error
  } = useStore();

  // Initialize data on mount if needed
  useEffect(() => {
    // Data is already initialized by Dashboard component
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Insights: State update', {
      transactions: transactions.length,
      apiInsights: !!apiInsights,
      apiInsightsStructure: apiInsights ? Object.keys(apiInsights) : 'null',
      loading,
      error
    });
  }, [transactions, apiInsights, loading, error]);

  // Debug function to load mock data manually
  const loadMockData = async () => {
    try {
      const { mockTransactions } = await import('../data/mockData');
      console.log('Manual mock data load:', mockTransactions.length);
      // Use the store's importData function
      const store = useStore.getState();
      store.importData(mockTransactions);
    } catch (error) {
      console.error('Failed to load mock data:', error);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading financial insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-semibold">Error loading insights</h3>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Data Available</h3>
          <p className="text-gray-500 mt-2">Add some transactions to see insights</p>
          {/* Debug button to load mock data */}
          <button
            onClick={loadMockData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Sample Data (Debug)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          AI-Powered Financial Intelligence
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Advanced analytics and predictions to optimize your financial future
        </p>
      </div>

      <EnhancedAnalytics transactions={transactions} />
    </div>
  );
};

export default Insights;