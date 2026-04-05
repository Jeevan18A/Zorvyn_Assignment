import React, { useMemo, useEffect } from 'react';
import SummaryCard from '../components/cards/SummaryCard';
import BalanceChart from '../components/charts/BalanceChart';
import CategoryChart from '../components/charts/CategoryChart';
import { useStore } from '../store/useStore';
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const Dashboard: React.FC = () => {
  const { 
    transactions, 
    role, 
    loading, 
    error, 
    fetchTransactions, 
    fetchSummary 
  } = useStore();

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      // Only fetch if no existing transactions
      if (transactions.length === 0) {
        await Promise.all([
          fetchTransactions(),
          fetchSummary()
        ]);
      }
    };
    loadData();
  }, [fetchTransactions, fetchSummary, transactions.length]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    // Always calculate from local transactions to ensure accuracy
    console.log('Dashboard: Calculating summary from', transactions.length, 'transactions');
    
    // Debug: Log sample transactions to verify data structure
    console.log('Dashboard: Sample transactions:', transactions.slice(0, 5));
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const calculatedBalance = income - expense;
    
    // Debug: Log individual calculations
    console.log('Dashboard: Individual calculations:', {
      incomeTransactions: transactions.filter(t => t.type === 'income').length,
      expenseTransactions: transactions.filter(t => t.type === 'expense').length,
      totalIncomeAmount: income,
      totalExpenseAmount: expense,
      balance: calculatedBalance
    });
    
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: calculatedBalance,
    };
  }, [transactions]);

  // Get recent transactions for the activity feed
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading your financial data...</p>
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
              <h3 className="text-red-800 dark:text-red-200 font-semibold">Error loading data</h3>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's your financial overview for {new Date().toLocaleString('default', { month: 'long' })}
        </p>
        {role === 'viewer' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>You are in Viewer mode - you can only see data, not make changes</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Total Balance" amount={balance} type="balance" />
        <SummaryCard title="Total Income" amount={totalIncome} type="income" />
        <SummaryCard title="Total Expenses" amount={totalExpense} type="expense" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Balance Trend (Last 30 Days)
          </h2>
          <BalanceChart transactions={transactions} />
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Spending Breakdown</h2>
          <CategoryChart transactions={transactions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Add your first transaction!
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.category}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                    {transaction.description && ` • ${transaction.description}`}
                  </p>
                </div>
                <div className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;