import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, icon }) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'income':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'expense':
        return <TrendingDown className="h-6 w-6 text-red-500" />;
      default:
        return <DollarSign className="h-6 w-6 text-primary-500" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'income':
        return 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800';
      case 'expense':
        return 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800';
      default:
        return 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800';
    }
  };

  const formattedAmount = formatCurrency(amount);

  return (
    <div className={`bg-gradient-to-br ${getColor()} rounded-xl border p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 animate-slide-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{formattedAmount}</p>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;