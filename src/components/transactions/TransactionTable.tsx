import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Search, X } from 'lucide-react';
import { useStore, type Transaction, type Role } from '../../store/useStore';
import { format } from 'date-fns';

interface TransactionTableProps {
  role: Role;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ role }) => {
  const { transactions, filters, setFilters, resetFilters, deleteTransaction } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    if (filters.search && !transaction.category.toLowerCase().includes(filters.search.toLowerCase()) &&
        !transaction.description?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }
    
    // Category filter
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.start && transaction.date < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && transaction.date > filters.dateRange.end) {
      return false;
    }
    
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { addTransaction, editTransaction } = useStore.getState();
    
    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
    } else {
      addTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    }
    
    resetForm();
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      amount: '',
      category: '',
      type: 'expense',
      description: '',
    });
  };

  const editTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type,
      description: transaction.description || '',
    });
    setShowAddModal(true);
  };

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ type: e.target.value as any })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters({ dateRange: { ...filters.dateRange, start: e.target.value } })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters({ dateRange: { ...filters.dateRange, end: e.target.value } })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="End Date"
          />
          
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
          
          {role === 'admin' && (
            <button
              onClick={() => {
                resetForm();
                setEditingTransaction(null);
                setShowAddModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              {role === 'admin' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={role === 'admin' ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              sortedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {transaction.description || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </td>
                  {role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => editTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Salary, Rent, Groceries"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTransaction(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;