import React from 'react';
import EnhancedTransactionTable from '../components/transactions/EnhancedTransactionTable';
import { useStore } from '../store/useStore';
import { Receipt, Filter } from 'lucide-react';

const Transactions: React.FC = () => {
  const { role } = useStore();

  return (
    <div className="container-responsive py-6 lg:py-8 animate-fade-in">
      <div className="mb-8 lg:mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Receipt className="h-8 w-8 text-primary-600" />
              Transactions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage and track all your financial transactions with advanced filtering and grouping
            </p>
          </div>
          {role === 'viewer' && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg animate-pulse">
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Viewer Mode - Read Only</span>
            </div>
          )}
        </div>
      </div>
      
      <EnhancedTransactionTable role={role} />
    </div>
  );
};

export default Transactions;