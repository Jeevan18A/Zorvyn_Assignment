// AI Service for Financial Intelligence and Predictions
import type { Transaction } from '../store/useStore';

export interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_alert' | 'savings_opportunity' | 'income_prediction' | 'risk_warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  category?: string;
  amount?: number;
  confidence: number;
  timestamp: Date;
}

export interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  timeFrame: 'week' | 'month' | 'quarter';
  factors: string[];
  recommendation: string;
}

export interface BudgetRecommendation {
  category: string;
  currentSpending: number;
  recommendedBudget: number;
  savingsPotential: number;
  reasoning: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  monthlyContribution: number;
  onTrack: boolean;
}

export class AIService {
  // private apiClient: any;

  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Generate AI insights based on transaction patterns
  async generateInsights(transactions: Transaction[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze spending patterns
    const spendingPatterns = this.analyzeSpendingPatterns(transactions);
    insights.push(...spendingPatterns);

    // Detect budget alerts
    const budgetAlerts = this.detectBudgetAlerts(transactions);
    insights.push(...budgetAlerts);

    // Find savings opportunities
    const savingsOpportunities = this.findSavingsOpportunities(transactions);
    insights.push(...savingsOpportunities);

    // Predict income trends
    const incomePredictions = this.predictIncomeTrends(transactions);
    insights.push(...incomePredictions);

    // Identify risk warnings
    const riskWarnings = this.identifyRiskWarnings(transactions);
    insights.push(...riskWarnings);

    // Sort by severity and timestamp
    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return -severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  // Generate spending predictions
  async generateSpendingPredictions(transactions: Transaction[]): Promise<SpendingPrediction[]> {
    const predictions: SpendingPrediction[] = [];
    const categories = [...new Set(transactions.map(t => t.category))];

    for (const category of categories) {
      const categoryTransactions = transactions.filter(t => t.category === category && t.type === 'expense');
      
      if (categoryTransactions.length < 3) continue; // Need sufficient data

      const prediction = this.predictCategorySpending(categoryTransactions, category);
      predictions.push(prediction);
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  // Generate budget recommendations
  async generateBudgetRecommendations(transactions: Transaction[]): Promise<BudgetRecommendation[]> {
    const recommendations: BudgetRecommendation[] = [];
    const monthlySpending = this.calculateMonthlySpendingByCategory(transactions);

    for (const [category, amount] of monthlySpending) {
      const recommendation = this.generateCategoryBudgetRecommendation(category, amount, transactions);
      recommendations.push(recommendation);
    }

    return recommendations.sort((a, b) => b.savingsPotential - a.savingsPotential);
  }

  // Generate personalized financial goals
  async generateFinancialGoals(transactions: Transaction[]): Promise<FinancialGoal[]> {
    const goals: FinancialGoal[] = [];
    const monthlyIncome = this.calculateMonthlyIncome(transactions);
    const monthlyExpenses = this.calculateMonthlyExpenses(transactions);
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const currentDate = new Date();

    // Emergency fund goal
    if (monthlyExpenses > 0) {
      const emergencyFundGoal: FinancialGoal = {
        id: 'emergency-fund',
        title: 'Build Emergency Fund',
        targetAmount: monthlyExpenses * 6, // 6 months of expenses
        currentAmount: this.calculateCurrentSavings(transactions),
        deadline: new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 1),
        category: 'Emergency Fund',
        priority: 'high',
        monthlyContribution: Math.max(100, monthlySavings * 0.3),
        onTrack: this.calculateCurrentSavings(transactions) >= monthlyExpenses * 3
      };
      goals.push(emergencyFundGoal);
    }

    // Debt reduction goal (if applicable)
    const debtCategories = this.identifyDebtCategories(transactions);
    if (debtCategories.length > 0) {
      const debtReductionGoal: FinancialGoal = {
        id: 'debt-reduction',
        title: 'Reduce High-Interest Debt',
        targetAmount: debtCategories.reduce((sum, cat) => sum + cat.amount, 0) * 0.8, // Reduce by 80%
        currentAmount: 0,
        deadline: new Date(currentDate.getFullYear(), currentDate.getMonth() + 12, 1),
        category: 'Debt Reduction',
        priority: 'high',
        monthlyContribution: monthlySavings * 0.4,
        onTrack: true
      };
      goals.push(debtReductionGoal);
    }

    // Investment goal
    if (monthlySavings > 200) {
      const investmentGoal: FinancialGoal = {
        id: 'investment',
        title: 'Build Investment Portfolio',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), 1),
        category: 'Investment',
        priority: 'medium',
        monthlyContribution: monthlySavings * 0.3,
        onTrack: false
      };
      goals.push(investmentGoal);
    }

    return goals;
  }

  // Private helper methods
  private analyzeSpendingPatterns(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const categorySpending = this.calculateMonthlySpendingByCategory(transactions);

    // Detect unusual spending increases
    for (const [category, amount] of categorySpending) {
      const trend = this.calculateSpendingTrend(transactions, category);
      
      if (trend.increase > 30) {
        insights.push({
          id: `spending-increase-${category}`,
          type: 'spending_pattern',
          title: `Unusual Increase in ${category}`,
          description: `Your ${category.toLowerCase()} spending increased by ${trend.increase.toFixed(1)}% compared to last month. This might indicate lifestyle inflation or loss of price sensitivity.`,
          severity: trend.increase > 50 ? 'high' : 'medium',
          actionable: true,
          category,
          amount,
          confidence: 0.85,
          timestamp: new Date()
        });
      }
    }

    return insights;
  }

  private detectBudgetAlerts(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const monthlySpending = this.calculateMonthlySpendingByCategory(transactions);
    const monthlyIncome = this.calculateMonthlyIncome(transactions);

    // Check if spending exceeds income
    const totalMonthlySpending = Array.from(monthlySpending.values()).reduce((sum, amount) => sum + amount, 0);
    
    if (totalMonthlySpending > monthlyIncome * 0.9) {
      insights.push({
        id: 'overspending-alert',
        type: 'budget_alert',
        title: 'High Spending Rate Detected',
        description: `You're spending ${((totalMonthlySpending / monthlyIncome) * 100).toFixed(1)}% of your income. Consider reducing expenses to at least 80% for sustainable savings.`,
        severity: 'high',
        actionable: true,
        amount: totalMonthlySpending,
        confidence: 0.95,
        timestamp: new Date()
      });
    }

    // Check individual category overspending
    const budgetThresholds = {
      'Dining': monthlyIncome * 0.15,
      'Entertainment': monthlyIncome * 0.10,
      'Shopping': monthlyIncome * 0.20,
      'Transport': monthlyIncome * 0.15
    };

    for (const [category, spending] of monthlySpending) {
      const threshold = budgetThresholds[category as keyof typeof budgetThresholds];
      if (threshold && spending > threshold) {
        insights.push({
          id: `category-overspend-${category}`,
          type: 'budget_alert',
          title: `${category} Budget Alert`,
          description: `Your ${category.toLowerCase()} spending of ₹${spending.toFixed(2)} exceeds recommended budget of ₹${threshold.toFixed(2)}.`,
          severity: 'medium',
          actionable: true,
          category,
          amount: spending,
          confidence: 0.90,
          timestamp: new Date()
        });
      }
    }

    return insights;
  }

  private findSavingsOpportunities(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];
    // const categorySpending = this.calculateMonthlySpendingByCategory(transactions);

    // Find subscription opportunities
    const subscriptions = transactions.filter(t => 
      t.category === 'Subscription' && t.type === 'expense'
    );

    if (subscriptions.length > 0) {
      const totalSubscriptions = subscriptions.reduce((sum, t) => sum + t.amount, 0);
      insights.push({
        id: 'subscription-review',
        type: 'savings_opportunity',
        title: 'Review Subscription Services',
        description: `You're spending ₹${totalSubscriptions.toFixed(2)} monthly on subscriptions. Review and cancel unused services to save money.`,
        severity: 'medium',
        actionable: true,
        category: 'Subscription',
        amount: totalSubscriptions,
        confidence: 0.80,
        timestamp: new Date()
      });
    }

    // Find frequent small expenses
    const smallExpenses = transactions.filter(t => 
      t.type === 'expense' && t.amount < 50
    );

    if (smallExpenses.length > 10) {
      const totalSmallExpenses = smallExpenses.reduce((sum, t) => sum + t.amount, 0);
      insights.push({
        id: 'small-expenses',
        type: 'savings_opportunity',
        title: 'Frequent Small Purchases Detected',
        description: `You made ${smallExpenses.length} small purchases totaling ₹${totalSmallExpenses.toFixed(2)}. Consider bundling purchases or setting daily spending limits.`,
        severity: 'low',
        actionable: true,
        amount: totalSmallExpenses,
        confidence: 0.75,
        timestamp: new Date()
      });
    }

    return insights;
  }

  private predictIncomeTrends(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const incomeTransactions = transactions.filter(t => t.type === 'income');

    if (incomeTransactions.length < 3) return insights;

    const monthlyIncome = this.calculateMonthlyIncome(transactions);
    const incomeTrend = this.calculateIncomeTrend(transactions);

    if (incomeTrend.decline > 10) {
      insights.push({
        id: 'income-decline',
        type: 'income_prediction',
        title: 'Income Trend Alert',
        description: `Your income has declined by ${incomeTrend.decline.toFixed(1)}% over recent months. Consider diversifying income sources or negotiating rates.`,
        severity: 'high',
        actionable: true,
        amount: monthlyIncome,
        confidence: 0.85,
        timestamp: new Date()
      });
    } else if (incomeTrend.growth > 20) {
      insights.push({
        id: 'income-growth',
        type: 'income_prediction',
        title: 'Positive Income Trend',
        description: `Your income has increased by ${incomeTrend.growth.toFixed(1)}%! This is a great opportunity to increase savings and investments.`,
        severity: 'low',
        actionable: true,
        amount: monthlyIncome,
        confidence: 0.90,
        timestamp: new Date()
      });
    }

    return insights;
  }

  private identifyRiskWarnings(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const monthlyIncome = this.calculateMonthlyIncome(transactions);
    const monthlyExpenses = this.calculateMonthlyExpenses(transactions);

    // Low savings rate warning
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    
    if (savingsRate < 5) {
      insights.push({
        id: 'low-savings',
        type: 'risk_warning',
        title: 'Low Savings Rate',
        description: `Your savings rate is only ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income for long-term security.`,
        severity: 'high',
        actionable: true,
        amount: savingsRate,
        confidence: 0.95,
        timestamp: new Date()
      });
    }

    // High dependency on single income source
    const incomeSources = new Map<string, number>();
    transactions.filter(t => t.type === 'income').forEach(t => {
      incomeSources.set(t.category, (incomeSources.get(t.category) || 0) + t.amount);
    });

    const maxIncomeSource = Math.max(...Array.from(incomeSources.values()));
    const totalIncome = Array.from(incomeSources.values()).reduce((sum, amount) => sum + amount, 0);

    if (maxIncomeSource / totalIncome > 0.8) {
      const dominantSource = Array.from(incomeSources.entries()).find(([_, amount]) => amount === maxIncomeSource)?.[0];
      
      insights.push({
        id: 'income-dependency',
        type: 'risk_warning',
        title: 'Income Source Concentration Risk',
        description: `${dominantSource} accounts for ${((maxIncomeSource / totalIncome) * 100).toFixed(1)}% of your income. Consider diversifying to reduce risk.`,
        severity: 'medium',
        actionable: true,
        category: dominantSource,
        amount: maxIncomeSource,
        confidence: 0.80,
        timestamp: new Date()
      });
    }

    return insights;
  }

  private predictCategorySpending(transactions: Transaction[], category: string): SpendingPrediction {
    const amounts = transactions.map(t => t.amount);
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Predict next month's spending with some randomness
    const predictedAmount = avgAmount + (Math.random() - 0.5) * standardDeviation;
    
    const factors = [];
    if (standardDeviation > avgAmount * 0.3) {
      factors.push('Highly variable spending pattern');
    }
    if (transactions.length >= 4) {
      factors.push('Consistent monthly occurrence');
    }
    
    return {
      category,
      predictedAmount: Math.max(0, predictedAmount),
      confidence: Math.max(0.5, Math.min(0.95, 1 - (standardDeviation / avgAmount))),
      timeFrame: 'month',
      factors,
      recommendation: this.generateSpendingRecommendation(category, avgAmount, standardDeviation)
    };
  }

  private generateSpendingRecommendation(category: string, avgAmount: number, stdDev: number): string {
    if (stdDev > avgAmount * 0.5) {
      return `Consider setting a strict budget for ${category.toLowerCase()} as your spending varies significantly month to month.`;
    } else if (avgAmount > 500) {
      return `Look for ways to reduce ${category.toLowerCase()} expenses, such as bulk buying or finding alternatives.`;
    } else {
      return `Your ${category.toLowerCase()} spending is consistent. Consider small optimizations to save even more.`;
    }
  }

  private generateCategoryBudgetRecommendation(
    category: string, 
    currentSpending: number, 
    transactions: Transaction[]
  ): BudgetRecommendation {
    // const categoryTransactions = transactions.filter(t => t.category === category && t.type === 'expense');
    const trend = this.calculateSpendingTrend(transactions, category);
    
    let recommendedBudget = currentSpending;
    let difficulty: 'easy' | 'moderate' | 'challenging' = 'moderate';
    
    if (trend.increase > 20) {
      recommendedBudget = currentSpending * 0.8; // Reduce by 20%
      difficulty = 'challenging';
    } else if (trend.increase > 10) {
      recommendedBudget = currentSpending * 0.9; // Reduce by 10%
      difficulty = 'moderate';
    } else {
      recommendedBudget = currentSpending * 0.95; // Reduce by 5%
      difficulty = 'easy';
    }
    
    const savingsPotential = currentSpending - recommendedBudget;
    
    return {
      category,
      currentSpending,
      recommendedBudget,
      savingsPotential,
      reasoning: `Based on your spending trend of ${trend.increase > 0 ? '+' : ''}${trend.increase.toFixed(1)}%, a ${difficulty} reduction is recommended.`,
      difficulty
    };
  }

  // Utility methods
  private calculateMonthlySpendingByCategory(transactions: Transaction[]): Map<string, number> {
    const categorySpending = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categorySpending.get(t.category) || 0;
        categorySpending.set(t.category, current + t.amount);
      });
    
    return categorySpending;
  }

  private calculateMonthlyIncome(transactions: Transaction[]): number {
    const monthlyIncome = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const month = t.date.substring(0, 7); // YYYY-MM
        const current = monthlyIncome.get(month) || 0;
        monthlyIncome.set(month, current + t.amount);
      });
    
    const amounts = Array.from(monthlyIncome.values());
    return amounts.length > 0 ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length : 0;
  }

  private calculateMonthlyExpenses(transactions: Transaction[]): number {
    const monthlyExpenses = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const month = t.date.substring(0, 7); // YYYY-MM
        const current = monthlyExpenses.get(month) || 0;
        monthlyExpenses.set(month, current + t.amount);
      });
    
    const amounts = Array.from(monthlyExpenses.values());
    return amounts.length > 0 ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length : 0;
  }

  private calculateSpendingTrend(transactions: Transaction[], category: string): { increase: number; decrease: number } {
    const categoryTransactions = transactions.filter(t => t.category === category && t.type === 'expense');
    const monthlyData = new Map<string, number>();
    
    categoryTransactions.forEach(t => {
      const month = t.date.substring(0, 7);
      monthlyData.set(month, (monthlyData.get(month) || 0) + t.amount);
    });
    
    const months = Array.from(monthlyData.keys()).sort();
    if (months.length < 2) return { increase: 0, decrease: 0 };
    
    const recent = monthlyData.get(months[months.length - 1]) || 0;
    const previous = monthlyData.get(months[months.length - 2]) || 0;
    
    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    return {
      increase: Math.max(0, change),
      decrease: Math.max(0, -change)
    };
  }

  private calculateIncomeTrend(transactions: Transaction[]): { growth: number; decline: number } {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const monthlyData = new Map<string, number>();
    
    incomeTransactions.forEach((t: Transaction) => {
      const month = t.date.substring(0, 7);
      monthlyData.set(month, (monthlyData.get(month) || 0) + t.amount);
    });
    
    const months = Array.from(monthlyData.keys()).sort();
    if (months.length < 2) return { growth: 0, decline: 0 };
    
    const recent = monthlyData.get(months[months.length - 1]) || 0;
    const previous = monthlyData.get(months[months.length - 2]) || 0;
    
    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    return {
      growth: Math.max(0, change),
      decline: Math.max(0, -change)
    };
  }

  private calculateCurrentSavings(transactions: Transaction[]): number {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, income - expenses);
  }

  private identifyDebtCategories(transactions: Transaction[]): Array<{ category: string; amount: number }> {
    // This is a simplified implementation
    // In a real app, this would connect to actual debt data
    const debtCategories = [];
    
    // Look for high-interest categories
    const highInterestCategories = ['Credit Card', 'Personal Loan', 'Payday Loan'];
    
    for (const category of highInterestCategories) {
      const categoryTransactions = transactions.filter(t => t.category === category && t.type === 'expense');
      if (categoryTransactions.length > 0) {
        const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        debtCategories.push({ category, amount });
      }
    }
    
    return debtCategories;
  }
}
