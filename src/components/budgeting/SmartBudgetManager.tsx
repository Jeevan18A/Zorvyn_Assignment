import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Target,
  Settings,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import type { Transaction } from '../../store/useStore';
import { ProgressBar, InteractiveCard, StaggeredContainer } from '../ui/MicroInteractions';
import { formatCurrency } from '../../utils/currency';

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'weekly' | 'yearly';
  alertThreshold: number;
  autoAdjust: boolean;
  history: Array<{ date: string; allocated: number; spent: number }>;
}

interface SmartBudgetManagerProps {
  transactions: Transaction[];
}

export default function SmartBudgetManager({ transactions }: SmartBudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    allocated: 0,
    period: 'monthly' as const,
    alertThreshold: 80,
    autoAdjust: true
  });

  // Initialize sample budgets
  useEffect(() => {
    const categories = [...new Set(transactions.map(t => t.category))];
    const sampleBudgets: Budget[] = categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category && t.type === 'expense');
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const allocated = Math.max(spent * 1.2, 500); // Default allocation with 20% buffer
      
      return {
        id: `budget-${category}`,
        category,
        allocated,
        spent,
        remaining: allocated - spent,
        period: 'monthly',
        alertThreshold: 80,
        autoAdjust: true,
        history: []
      };
    });
    
    setBudgets(sampleBudgets);
  }, [transactions]);

  const calculateBudgetStatus = (budget: Budget) => {
    const percentageUsed = (budget.spent / budget.allocated) * 100;
    if (percentageUsed >= 100) return { status: 'exceeded', color: 'red' };
    if (percentageUsed >= budget.alertThreshold) return { status: 'warning', color: 'yellow' };
    if (percentageUsed >= 60) return { status: 'caution', color: 'orange' };
    return { status: 'on-track', color: 'green' };
  };

  const handleCreateBudget = () => {
    if (newBudget.category && newBudget.allocated > 0) {
      const budget: Budget = {
        id: `budget-${Date.now()}`,
        category: newBudget.category,
        allocated: newBudget.allocated,
        spent: 0,
        remaining: newBudget.allocated,
        period: newBudget.period,
        alertThreshold: newBudget.alertThreshold,
        autoAdjust: newBudget.autoAdjust,
        history: []
      };
      
      setBudgets([...budgets, budget]);
      setNewBudget({
        category: '',
        allocated: 0,
        period: 'monthly',
        alertThreshold: 80,
        autoAdjust: true
      });
      setShowCreateForm(false);
    }
  };

  const handleUpdateBudget = (budgetId: string, field: keyof Budget, value: any) => {
    setBudgets(budgets.map(budget => {
      if (budget.id === budgetId) {
        const updated = { ...budget, [field]: value };
        if (field === 'allocated') {
          updated.spent = Math.min(budget.spent, value);
          updated.remaining = value - budget.spent;
        }
        return updated;
      }
      return budget;
    }));
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter(b => b.id !== budgetId));
  };

  const getBudgetRecommendations = () => {
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const averageUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    const recommendations = [];
    
    if (averageUtilization > 90) {
      recommendations.push({
        type: 'overspending',
        message: 'Your overall budget utilization is very high. Consider reducing allocations or increasing total budget.',
        severity: 'high'
      });
    }
    
    const overBudgetCategories = budgets.filter(b => calculateBudgetStatus(b).status === 'exceeded');
    if (overBudgetCategories.length > 0) {
      recommendations.push({
        type: 'budget_exceeded',
        message: `${overBudgetCategories.length} categories have exceeded their budget. Review and adjust spending.`,
        severity: 'medium'
      });
    }
    
    const underutilizedCategories = budgets.filter(b => {
      const status = calculateBudgetStatus(b);
      return status.status === 'on-track' && (b.spent / b.allocated) < 0.5;
    });
    
    if (underutilizedCategories.length > 0) {
      recommendations.push({
        type: 'underutilization',
        message: `${underutilizedCategories.length} categories are significantly underutilized. Consider reallocating funds.`,
        severity: 'low'
      });
    }
    
    return recommendations;
  };

  const budgetChartData = budgets.map(budget => ({
    name: budget.category,
    value: budget.spent,
    budget: budget.allocated,
    remaining: budget.remaining
  }));

  const spendingTrendData = budgets.map(budget => {
    const recentTransactions = transactions.filter(t => 
      t.category === budget.category && 
      t.type === 'expense' &&
      new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const previousTransactions = transactions.filter(t => 
      t.category === budget.category && 
      t.type === 'expense' &&
      new Date(t.date) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
      new Date(t.date) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const recentSpending = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const previousSpending = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      category: budget.category,
      current: recentSpending,
      previous: previousSpending,
      trend: previousSpending > 0 ? ((recentSpending - previousSpending) / previousSpending) * 100 : 0
    };
  });

  const recommendations = getBudgetRecommendations();

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            Smart Budget Manager
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
        </div>

        {/* Create Budget Form */}
        {showCreateForm && (
          <InteractiveCard className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Create New Budget</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select category...</option>
                  {[...new Set(transactions.map(t => t.category))].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allocated Amount
                </label>
                <input
                  type="number"
                  value={newBudget.allocated}
                  onChange={(e) => setNewBudget({ ...newBudget, allocated: Number(e.target.value) })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Period
                </label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as any })}
                  className="input-field"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  value={newBudget.alertThreshold}
                  onChange={(e) => setNewBudget({ ...newBudget, alertThreshold: Number(e.target.value) })}
                  className="input-field"
                  min="50"
                  max="100"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBudget}
                className="btn-primary"
              >
                Create Budget
              </button>
            </div>
          </InteractiveCard>
        )}

        {/* Budget List */}
        <StaggeredContainer className="space-y-4">
          {budgets.map((budget) => {
            const status = calculateBudgetStatus(budget);
            const percentageUsed = (budget.spent / budget.allocated) * 100;
            
            return (
              <InteractiveCard key={budget.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${status.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' : ''}
                      ${status.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}
                      ${status.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' : ''}
                      ${status.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' : ''}
                    `}>
                      {status.status === 'exceeded' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {status.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      {status.status === 'caution' && <TrendingUp className="w-4 h-4 text-orange-600" />}
                      {status.status === 'on-track' && <Target className="w-4 h-4 text-green-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{budget.category}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingBudget(budget.id)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Budget Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className={`text-lg font-semibold ${
                      budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(budget.remaining)}
                    </span>
                  </div>
                  
                  <ProgressBar 
                    value={percentageUsed} 
                    max={100} 
                    size="md"
                    color={status.color === 'red' ? 'red' : status.color === 'yellow' ? 'yellow' : status.color === 'orange' ? 'yellow' : 'green'}
                  />
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {percentageUsed.toFixed(1)}% of budget used
                  </div>
                </div>
                
                {/* Edit Form */}
                {editingBudget === budget.id && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Allocated Amount
                        </label>
                        <input
                          type="number"
                          value={budget.allocated}
                          onChange={(e) => handleUpdateBudget(budget.id, 'allocated', Number(e.target.value))}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alert Threshold (%)
                        </label>
                        <input
                          type="number"
                          value={budget.alertThreshold}
                          onChange={(e) => handleUpdateBudget(budget.id, 'alertThreshold', Number(e.target.value))}
                          className="input-field"
                          min="50"
                          max="100"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setEditingBudget(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setEditingBudget(null)}
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </InteractiveCard>
            );
          })}
        </StaggeredContainer>
      </div>

      {/* Budget Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {budgetChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Spent' ? '#ef4444' : '#10b981'} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending Trends</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Bar dataKey="current" fill="#3b82f6" />
              <Bar dataKey="previous" fill="#93c5fd" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            AI Budget Recommendations
          </h4>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className={`
                p-4 rounded-lg border-l-4
                ${rec.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : ''}
                ${rec.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' : ''}
                ${rec.severity === 'low' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''}
              `}>
                <div className="flex items-start gap-3">
                  <div>
                    {rec.severity === 'high' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    {rec.severity === 'medium' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {rec.severity === 'low' && <Target className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {rec.type.replace('_', ' ').toUpperCase()}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rec.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
