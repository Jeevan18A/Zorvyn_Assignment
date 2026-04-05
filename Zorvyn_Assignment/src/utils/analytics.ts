// Advanced Analytics Engine for Financial Intelligence
import type { Transaction } from '../store/useStore';
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns';

export interface SpendingPattern {
  category: string;
  averageAmount: number;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  seasonality: 'high' | 'medium' | 'low';
}

export interface Prediction {
  type: 'spending' | 'income' | 'savings';
  amount: number;
  confidence: number;
  timeframe: 'next_month' | 'next_quarter' | 'next_year';
  factors: string[];
}

export interface FinancialHealthScore {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    savingsRate: number;
    debtToIncome: number;
    spendingConsistency: number;
    emergencyFund: number;
  };
  recommendations: string[];
}

export interface CashFlowAnalysis {
  monthly: {
    month: string;
    income: number;
    expenses: number;
    net: number;
  }[];
  trends: {
    income: 'increasing' | 'decreasing' | 'stable';
    expenses: 'increasing' | 'decreasing' | 'stable';
    net: 'improving' | 'declining' | 'stable';
  };
  projections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

export class AnalyticsEngine {
  private transactions: Transaction[];

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  // Analyze spending patterns by category
  analyzeSpendingPatterns(): SpendingPattern[] {
    const categories = [...new Set(this.transactions.map(t => t.category))];
    
    return categories.map(category => {
      const categoryTransactions = this.transactions.filter(t => 
        t.category === category && t.type === 'expense'
      );
      
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = categoryTransactions.length > 0 ? totalAmount / categoryTransactions.length : 0;
      const frequency = categoryTransactions.length;
      
      // Calculate trend (compare last 3 months vs previous 3 months)
      const trend = this.calculateCategoryTrend(categoryTransactions);
      
      // Calculate seasonality
      const seasonality = this.calculateSeasonality(categoryTransactions);
      
      return {
        category,
        averageAmount,
        frequency,
        trend: trend.direction,
        trendPercentage: trend.percentage,
        seasonality,
      };
    }).sort((a, b) => b.averageAmount - a.averageAmount);
  }

  // Generate spending predictions
  generatePredictions(): Prediction[] {
    const predictions: Prediction[] = [];
    
    // Next month spending prediction
    const monthlySpending = this.calculateMonthlyAverage('expense');
    const spendingTrend = this.calculateSpendingTrend();
    
    predictions.push({
      type: 'spending',
      amount: monthlySpending * (1 + spendingTrend),
      confidence: 0.85,
      timeframe: 'next_month',
      factors: [
        spendingTrend > 0 ? 'Increasing spending trend' : 'Decreasing spending trend',
        'Seasonal patterns',
        'Historical averages'
      ]
    });
    
    // Next month income prediction
    const monthlyIncome = this.calculateMonthlyAverage('income');
    const incomeTrend = this.calculateIncomeTrend();
    
    predictions.push({
      type: 'income',
      amount: monthlyIncome * (1 + incomeTrend),
      confidence: 0.90,
      timeframe: 'next_month',
      factors: [
        incomeTrend > 0 ? 'Increasing income trend' : 'Stable income',
        'Regular income sources',
        'Historical consistency'
      ]
    });
    
    // Savings prediction
    const predictedSavings = (monthlyIncome * (1 + incomeTrend)) - (monthlySpending * (1 + spendingTrend));
    
    predictions.push({
      type: 'savings',
      amount: Math.max(0, predictedSavings),
      confidence: 0.75,
      timeframe: 'next_month',
      factors: [
        'Income vs expense projection',
        'Spending patterns',
        'Savings consistency'
      ]
    });
    
    return predictions;
  }

  // Calculate financial health score
  calculateFinancialHealth(): FinancialHealthScore {
    const monthlyIncome = this.calculateMonthlyAverage('income');
    const monthlyExpenses = this.calculateMonthlyAverage('expense');
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    
    // Calculate debt-to-income ratio (simplified - using expenses as proxy)
    const debtToIncome = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
    
    // Calculate spending consistency
    const spendingConsistency = this.calculateSpendingConsistency();
    
    // Calculate emergency fund (simplified - using recent savings)
    const emergencyFund = this.calculateEmergencyFund();
    
    // Calculate overall score
    const score = Math.round(
      (savingsRate * 0.3 + 
       (1 - debtToIncome) * 0.3 + 
       spendingConsistency * 0.2 + 
       emergencyFund * 0.2) * 100
    );
    
    let grade: FinancialHealthScore['grade'];
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';
    
    const recommendations = this.generateRecommendations(savingsRate, debtToIncome, spendingConsistency, emergencyFund);
    
    return {
      score,
      grade,
      factors: {
        savingsRate,
        debtToIncome,
        spendingConsistency,
        emergencyFund,
      },
      recommendations,
    };
  }

  // Analyze cash flow
  analyzeCashFlow(): CashFlowAnalysis {
    const monthly = this.getMonthlyCashFlow();
    const trends = this.calculateCashFlowTrends(monthly);
    const projections = this.calculateCashFlowProjections(monthly);
    
    return {
      monthly,
      trends,
      projections,
    };
  }

  // Helper methods
  private calculateCategoryTrend(transactions: Transaction[]): { direction: 'increasing' | 'decreasing' | 'stable', percentage: number } {
    const now = new Date();
    const last3Months = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: subMonths(now, 3), end: now });
    });
    
    const previous3Months = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: subMonths(now, 6), end: subMonths(now, 3) });
    });
    
    const recentAvg = last3Months.length > 0 ? last3Months.reduce((sum, t) => sum + t.amount, 0) / last3Months.length : 0;
    const previousAvg = previous3Months.length > 0 ? previous3Months.reduce((sum, t) => sum + t.amount, 0) / previous3Months.length : 0;
    
    if (previousAvg === 0) return { direction: 'stable', percentage: 0 };
    
    const percentage = (recentAvg - previousAvg) / previousAvg;
    
    if (Math.abs(percentage) < 0.05) return { direction: 'stable', percentage: Math.abs(percentage) * 100 };
    return { 
      direction: percentage > 0 ? 'increasing' : 'decreasing', 
      percentage: Math.abs(percentage) * 100 
    };
  }

  private calculateSeasonality(transactions: Transaction[]): 'high' | 'medium' | 'low' {
    // Simple seasonality based on transaction frequency variation
    const monthlyCounts = new Map<string, number>();
    
    transactions.forEach(t => {
      const month = format(parseISO(t.date), 'yyyy-MM');
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);
    });
    
    const counts = Array.from(monthlyCounts.values());
    if (counts.length < 2) return 'low';
    
    const avg = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length;
    const coefficient = Math.sqrt(variance) / avg;
    
    if (coefficient > 0.5) return 'high';
    if (coefficient > 0.2) return 'medium';
    return 'low';
  }

  private calculateMonthlyAverage(type: 'income' | 'expense'): number {
    const typeTransactions = this.transactions.filter(t => t.type === type);
    const monthlyTotals = new Map<string, number>();
    
    typeTransactions.forEach(t => {
      const month = format(parseISO(t.date), 'yyyy-MM');
      monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + t.amount);
    });
    
    const totals = Array.from(monthlyTotals.values());
    return totals.length > 0 ? totals.reduce((sum, total) => sum + total, 0) / totals.length : 0;
  }

  private calculateSpendingTrend(): number {
    const expenses = this.transactions.filter(t => t.type === 'expense');
    return this.calculateTrend(expenses);
  }

  private calculateIncomeTrend(): number {
    const income = this.transactions.filter(t => t.type === 'income');
    return this.calculateTrend(income);
  }

  private calculateTrend(transactions: Transaction[]): number {
    const now = new Date();
    const recent = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: subMonths(now, 1), end: now });
    });
    
    const previous = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: subMonths(now, 2), end: subMonths(now, 1) });
    });
    
    const recentTotal = recent.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previous.reduce((sum, t) => sum + t.amount, 0);
    
    return previousTotal > 0 ? (recentTotal - previousTotal) / previousTotal : 0;
  }

  private calculateSpendingConsistency(): number {
    const expenses = this.transactions.filter(t => t.type === 'expense');
    const monthlyTotals = new Map<string, number>();
    
    expenses.forEach(t => {
      const month = format(parseISO(t.date), 'yyyy-MM');
      monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + t.amount);
    });
    
    const totals = Array.from(monthlyTotals.values());
    if (totals.length < 2) return 1;
    
    const avg = totals.reduce((sum, total) => sum + total, 0) / totals.length;
    const variance = totals.reduce((sum, total) => sum + Math.pow(total - avg, 2), 0) / totals.length;
    const coefficient = Math.sqrt(variance) / avg;
    
    // Lower coefficient of variation = higher consistency
    return Math.max(0, 1 - coefficient);
  }

  private calculateEmergencyFund(): number {
    // Simplified: check if user has 3+ months of expenses saved
    const monthlyExpenses = this.calculateMonthlyAverage('expense');
    const totalSavings = this.calculateTotalSavings();
    
    return Math.min(1, totalSavings / (monthlyExpenses * 3));
  }

  private calculateTotalSavings(): number {
    const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return Math.max(0, income - expenses);
  }

  private generateRecommendations(
    savingsRate: number, 
    debtToIncome: number, 
    spendingConsistency: number, 
    emergencyFund: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (savingsRate < 0.2) {
      recommendations.push('Increase savings rate to at least 20% of income');
    }
    
    if (debtToIncome > 0.5) {
      recommendations.push('Reduce expenses to lower debt-to-income ratio below 50%');
    }
    
    if (spendingConsistency < 0.7) {
      recommendations.push('Work on spending consistency for better financial planning');
    }
    
    if (emergencyFund < 1) {
      recommendations.push('Build emergency fund covering 3+ months of expenses');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Great job! Maintain your current financial habits');
    }
    
    return recommendations;
  }

  private getMonthlyCashFlow(): CashFlowAnalysis['monthly'] {
    const monthlyData = new Map<string, { income: number; expenses: number }>();
    
    this.transactions.forEach(t => {
      const month = format(parseISO(t.date), 'yyyy-MM');
      const current = monthlyData.get(month) || { income: 0, expenses: 0 };
      
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expenses += t.amount;
      }
      
      monthlyData.set(month, current);
    });
    
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: format(parseISO(month + '-01'), 'MMM yyyy'),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateCashFlowTrends(monthly: CashFlowAnalysis['monthly']): CashFlowAnalysis['trends'] {
    if (monthly.length < 2) {
      return {
        income: 'stable',
        expenses: 'stable',
        net: 'stable',
      };
    }
    
    const recent = monthly.slice(-3);
    const previous = monthly.slice(-6, -3);
    
    const calculateTrend = (recentData: number[], previousData: number[]): 'increasing' | 'decreasing' | 'stable' => {
      const recentAvg = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
      const previousAvg = previousData.reduce((sum, val) => sum + val, 0) / previousData.length;
      
      if (previousAvg === 0) return 'stable';
      
      const change = (recentAvg - previousAvg) / previousAvg;
      
      if (Math.abs(change) < 0.05) return 'stable';
      return change > 0 ? 'increasing' : 'decreasing';
    };
    
    const incomeTrend = calculateTrend(recent.map(m => m.income), previous.map(m => m.income));
    const expensesTrend = calculateTrend(recent.map(m => m.expenses), previous.map(m => m.expenses));
    const netTrend = calculateTrend(recent.map(m => m.net), previous.map(m => m.net));
    
    // Convert net trend to proper type
    let netTrendConverted: 'improving' | 'declining' | 'stable';
    if (netTrend === 'increasing') netTrendConverted = 'improving';
    else if (netTrend === 'decreasing') netTrendConverted = 'declining';
    else netTrendConverted = 'stable';
    
    return {
      income: incomeTrend,
      expenses: expensesTrend,
      net: netTrendConverted,
    };
  }

  private calculateCashFlowProjections(monthly: CashFlowAnalysis['monthly']): CashFlowAnalysis['projections'] {
    if (monthly.length === 0) {
      return { nextMonth: 0, nextQuarter: 0, nextYear: 0 };
    }
    
    const recentMonths = monthly.slice(-3);
    const avgNet = recentMonths.reduce((sum, m) => sum + m.net, 0) / recentMonths.length;
    
    const currentNet = monthly[monthly.length - 1].net;
    const trend = avgNet - currentNet;
    
    return {
      nextMonth: currentNet + trend,
      nextQuarter: currentNet * 3 + trend * 3,
      nextYear: currentNet * 12 + trend * 12,
    };
  }
}
