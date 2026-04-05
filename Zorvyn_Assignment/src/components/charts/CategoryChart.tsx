import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Transaction } from '../../store/useStore';

interface CategoryChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    console.log('CategoryChart: Transactions received:', transactions.length);
    console.log('CategoryChart: Sample transactions:', transactions.slice(0, 3));
    
    const expenses = transactions.filter(t => t.type === 'expense');
    console.log('CategoryChart: Expenses found:', expenses.length);
    
    const categoryMap = new Map<string, number>();
    
    expenses.forEach((transaction) => {
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + transaction.amount);
    });
    
    console.log('CategoryChart: Category map:', Array.from(categoryMap.entries()));
    
    const data = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    
    console.log('CategoryChart: Final chart data:', data);
    return data;
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No expense data available
      </div>
    );
  }

  console.log('CategoryChart: Rendering chart with data:', chartData);

  return (
    <div>
      {/* Debug fallback - show data as list */}
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold mb-2">Spending by Category (Debug):</h4>
        {chartData.map((item, index) => (
          <div key={index} className="flex justify-between py-1">
            <span>{item.name}:</span>
            <span className="font-semibold">${item.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      {/* Actual chart */}
      <div className="w-full h-80 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={undefined}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`$${value}`, 'Amount']}
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;