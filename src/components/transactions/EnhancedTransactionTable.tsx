import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Plus, Search, X, Download, Filter, ChevronDown, Loader2, Edit2 } from 'lucide-react';
import { useStore, type Transaction, type Role } from '../../store/useStore';
import { format, startOfWeek, parseISO } from 'date-fns';

interface EnhancedTransactionTableProps {
  role: Role;
}

const EnhancedTransactionTable: React.FC<EnhancedTransactionTableProps> = ({ role }) => {
  const { 
    transactions, 
    filters, 
    setFilters, 
    resetFilters, 
    removeTransaction,
    createTransaction,
    updateTransaction,
    exportData,
    clearAllData,
    loading,
    error,
    fetchTransactions
  } = useStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'expense',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Load transactions on mount
  useEffect(() => {
    // Only fetch if no existing transactions
    if (transactions.length === 0) {
      fetchTransactions();
    }
  }, [fetchTransactions, transactions.length]);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(t =>
        t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(t => t.date >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(t => t.date <= filters.dateRange.end);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Grouping
    if (filters.groupBy && filters.groupBy !== 'none') {
      const grouped = filtered.reduce((acc, transaction) => {
        let key: string;
        const date = parseISO(transaction.date);
        
        switch (filters.groupBy) {
          case 'category':
            key = transaction.category;
            break;
          case 'month':
            key = format(date, 'yyyy-MM');
            break;
          case 'week':
            const weekStart = startOfWeek(date);
            key = format(weekStart, 'yyyy-MM-dd');
            break;
          default:
            key = 'all';
        }
        
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(transaction);
        return acc;
      }, {} as Record<string, Transaction[]>);

      return grouped;
    }

    return filtered;
  }, [transactions, filters]);

  const handleAddTransaction = async () => {
    if (newTransaction.category && newTransaction.amount && newTransaction.date) {
      setIsSubmitting(true);
      try {
        if (editingTransaction) {
          // Update existing transaction
          await updateTransaction(editingTransaction.id, {
            ...newTransaction as Omit<Transaction, 'id'>,
            amount: Number(newTransaction.amount)
          });
        } else {
          // Create new transaction
          await createTransaction({
            ...newTransaction as Omit<Transaction, 'id'>,
            amount: Number(newTransaction.amount)
          });
        }
        
        // Reset form
        setNewTransaction({
          type: 'expense',
          category: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        setEditingTransaction(null);
        setShowAddModal(false);
      } catch (error) {
        console.error('Failed to save transaction:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await removeTransaction(id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    exportData(format);
  };

  const handleClearAll = () => {
    clearAllData();
  };

  const renderTransactionRow = (transaction: Transaction) => (
    <tr key={transaction.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="px-4 py-3 text-sm">
        {format(new Date(transaction.date), 'MMM dd, yyyy')}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          transaction.type === 'income' 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {transaction.type}
        </span>
      </td>
      <td className="px-4 py-3 font-medium">{transaction.category}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {transaction.description || '-'}
      </td>
      <td className={`px-4 py-3 font-semibold ${
        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
      </td>
      {role === 'admin' && (
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditTransaction(transaction)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteTransaction(transaction.id)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );

  const renderGroupedTransactions = () => {
    const grouped = filteredTransactions as Record<string, Transaction[]>;
    
    return Object.entries(grouped).map(([groupKey, groupTransactions]) => (
      <div key={groupKey} className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          {filters.groupBy === 'category' && groupKey}
          {filters.groupBy === 'month' && format(parseISO(groupKey + '-01'), 'MMMM yyyy')}
          {filters.groupBy === 'week' && `Week of ${format(parseISO(groupKey), 'MMM dd, yyyy')}`}
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                {role === 'admin' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {groupTransactions.map(renderTransactionRow)}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  const totalAmount = useMemo(() => {
    const filtered = Array.isArray(filteredTransactions) 
      ? filteredTransactions 
      : Object.values(filteredTransactions as Record<string, Transaction[]>).flat();
    
    return filtered.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
  }, [filteredTransactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <X className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="text-red-800 dark:text-red-200 font-semibold">Error loading transactions</h3>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header with Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Transactions
          </h2>
          
          <div className="flex flex-wrap items-center gap-2">
            {role === 'admin' && (
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setNewTransaction({
                    type: 'expense',
                    category: '',
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                  });
                  setShowAddModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={() => handleExport('csv')}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    placeholder="Search transactions..."
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ category: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group By
                </label>
                <select
                  value={filters.groupBy || 'none'}
                  onChange={(e) => setFilters({ groupBy: e.target.value as any })}
                  className="input-field"
                >
                  <option value="none">None</option>
                  <option value="category">Category</option>
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({ 
                    dateRange: { ...filters.dateRange, start: e.target.value } 
                  })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({ 
                    dateRange: { ...filters.dateRange, end: e.target.value } 
                  })}
                  className="input-field"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="btn-secondary w-full"
                >
                  Reset Filters
                </button>
              </div>
              
              {role === 'admin' && (
                <div className="flex items-end">
                  <button
                    onClick={handleClearAll}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {Array.isArray(filteredTransactions) ? filteredTransactions.length : Object.values(filteredTransactions as Record<string, Transaction[]>).flat().length} transactions
          </div>
          <div className={`text-lg font-semibold ${
            totalAmount >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Net Total: {totalAmount >= 0 ? '+' : ''}${totalAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {Array.isArray(filteredTransactions) ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                {role === 'admin' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map(renderTransactionRow)}
            </tbody>
          </table>
        </div>
      ) : (
        renderGroupedTransactions()
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  setNewTransaction({
                    type: 'expense',
                    category: '',
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  placeholder="Enter category"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  setNewTransaction({
                    type: 'expense',
                    category: '',
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                  });
                }}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="btn-primary flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTransactionTable;
