import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import { AIService, type AIInsight, type SpendingPrediction, type BudgetRecommendation, type FinancialGoal } from '../../services/aiService';
import { formatCurrency } from '../../utils/currency';
import type { Transaction } from '../../store/useStore';
import { AnimatedNumber, ProgressBar, InteractiveCard, StaggeredContainer, SparkleEffect } from '../ui/MicroInteractions';

interface AIInsightsProps {
  transactions: Transaction[];
}

export default function AIInsights({ transactions }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateAIInsights = async () => {
      setLoading(true);
      try {
        const aiService = AIService.getInstance();
        
        // Generate all AI insights
        const [aiInsights, spendingPredictions, budgetRecommendations, financialGoals] = await Promise.all([
          aiService.generateInsights(transactions),
          aiService.generateSpendingPredictions(transactions),
          aiService.generateBudgetRecommendations(transactions),
          aiService.generateFinancialGoals(transactions)
        ]);

        setInsights(aiInsights);
        setPredictions(spendingPredictions);
        setRecommendations(budgetRecommendations);
        setGoals(financialGoals);
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
      } finally {
        setLoading(false);
      }
    };

    if (transactions.length > 0) {
      generateAIInsights();
    }
  }, [transactions]);

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'spending_pattern': return TrendingUp;
      case 'budget_alert': return AlertTriangle;
      case 'savings_opportunity': return DollarSign;
      case 'income_prediction': return TrendingUp;
      case 'risk_warning': return Shield;
      default: return Lightbulb;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">AI is analyzing your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-500" />
          AI-Powered Insights
        </h3>
        
        <StaggeredContainer className="space-y-3">
          {insights.slice(0, 5).map((insight) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <InteractiveCard key={insight.id} hoverEffect="lift" className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                      {insight.actionable && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          Actionable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </InteractiveCard>
            );
          })}
        </StaggeredContainer>
      </div>

      {/* Spending Predictions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          Spending Predictions
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {predictions.slice(0, 4).map((prediction) => (
            <InteractiveCard key={prediction.category} hoverEffect="glow" className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {prediction.category}
                  </h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(prediction.confidence * 100)}% confidence
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Predicted next month
                    </div>
                    <AnimatedNumber 
                      value={prediction.predictedAmount} 
                      prefix="$" 
                      className="text-xl font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <ProgressBar 
                    value={prediction.confidence * 100} 
                    max={100} 
                    size="sm" 
                    color={prediction.confidence > 0.8 ? 'green' : prediction.confidence > 0.6 ? 'yellow' : 'red'}
                  />
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="font-medium mb-1">Recommendation:</div>
                  <div>{prediction.recommendation}</div>
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </div>

      {/* Budget Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-500" />
          Smart Budget Recommendations
        </h3>
        
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec) => (
            <InteractiveCard key={rec.category} hoverEffect="bounce" className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {rec.category}
                </h4>
                <span className={`
                  text-xs px-2 py-1 rounded
                  ${rec.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
                  ${rec.difficulty === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : ''}
                  ${rec.difficulty === 'challenging' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' : ''}
                `}>
                  {rec.difficulty}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</div>
                  <div className="text-lg font-semibold text-red-600">
                    {formatCurrency(rec.currentSpending)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Recommended</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(rec.recommendedBudget)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Savings</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(rec.savingsPotential)}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {rec.reasoning}
              </div>
            </InteractiveCard>
          ))}
        </div>
      </div>

      {/* Financial Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-500" />
          AI-Generated Financial Goals
        </h3>
        
        <div className="space-y-4">
          {goals.map((goal) => (
            <InteractiveCard key={goal.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {goal.title}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Due by {goal.deadline.toLocaleDateString()}
                  </div>
                </div>
                <span className={`
                  text-xs px-2 py-1 rounded
                  ${goal.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' : ''}
                  ${goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : ''}
                  ${goal.priority === 'low' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
                `}>
                  {goal.priority}
                </span>
              </div>
              
              <div className="space-y-2">
                <ProgressBar 
                  value={goal.currentAmount} 
                  max={goal.targetAmount} 
                  showPercentage={true}
                  color={goal.onTrack ? 'green' : 'yellow'}
                />
                
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Monthly: {formatCurrency(goal.monthlyContribution)}</span>
                  <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
              
              {goal.onTrack && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <SparkleEffect trigger={goal.onTrack}>
                    <span>✓ On track to reach your goal!</span>
                  </SparkleEffect>
                </div>
              )}
            </InteractiveCard>
          ))}
        </div>
      </div>
    </div>
  );
}
