import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Heart, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  AnalyticsEngine
} from '../../utils/analytics';
import { formatCurrency } from '../../utils/currency';
import type { Transaction } from '../../store/useStore';
import type { 
  FinancialHealthScore
} from '../../utils/analytics';

interface EnhancedAnalyticsProps {
  transactions: Transaction[];
}

export default function EnhancedAnalytics({ transactions }: EnhancedAnalyticsProps) {
  const analytics = new AnalyticsEngine(transactions);
  
  const spendingPatterns = analytics.analyzeSpendingPatterns();
  const predictions = analytics.generatePredictions();
  const financialHealth = analytics.calculateFinancialHealth();
  const cashFlow = analytics.analyzeCashFlow();

  const getGradeColor = (grade: FinancialHealthScore['grade']) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'B':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'C':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'D':
      case 'F':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Financial Health Score
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(financialHealth.grade)}`}>
            {financialHealth.grade} ({financialHealth.score}/100)
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(financialHealth.factors.savingsRate * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(financialHealth.factors.debtToIncome * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Debt-to-Income</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(financialHealth.factors.spendingConsistency * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(financialHealth.factors.emergencyFund * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Emergency Fund</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommendations:</h4>
          {financialHealth.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              {rec}
            </div>
          ))}
        </div>
      </div>

      {/* AI Predictions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-500" />
          AI-Powered Predictions
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {prediction.type}
                </span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                  {Math.round(prediction.confidence * 100)}% confidence
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(prediction.amount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {prediction.timeframe.replace('_', ' ')}
              </div>
              <div className="space-y-1">
                {prediction.factors.slice(0, 2).map((factor, i) => (
                  <div key={i} className="text-xs text-gray-500 dark:text-gray-400">
                    • {factor}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending Patterns */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Spending Patterns Analysis
        </h3>
        
        <div className="space-y-3">
          {spendingPatterns.slice(0, 5).map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getTrendIcon(pattern.trend)}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pattern.category}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {pattern.frequency} transactions
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(pattern.averageAmount)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Avg. per transaction
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-500" />
          Cash Flow Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Trends</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(cashFlow.trends.income)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {cashFlow.trends.income}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(cashFlow.trends.expenses)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {cashFlow.trends.expenses}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Net Cash Flow</span>
                <div className="flex items-center gap-2">
                  {cashFlow.trends.net === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {cashFlow.trends.net === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {cashFlow.trends.net === 'stable' && <Activity className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {cashFlow.trends.net}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Projections</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Month</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(cashFlow.projections.nextMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Quarter</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(cashFlow.projections.nextQuarter)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Year</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(cashFlow.projections.nextYear)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Budget Insights
        </h3>
        
        <div className="space-y-3">
          {spendingPatterns
            .filter(pattern => pattern.trend === 'increasing' && pattern.trendPercentage > 20)
            .slice(0, 3)
            .map((pattern, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {pattern.category} spending is increasing
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Up {Math.round(pattern.trendPercentage)}% from last month. Consider reviewing this category.
                  </div>
                </div>
              </div>
            ))}
          
          {spendingPatterns.filter(pattern => pattern.trend === 'increasing' && pattern.trendPercentage > 20).length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-sm">Great job! No concerning spending trends detected.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
