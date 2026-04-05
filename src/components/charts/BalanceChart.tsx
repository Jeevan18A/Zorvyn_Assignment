import React, { useMemo } from 'react';
import type { Transaction } from '../../store/useStore';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Legend } from 'recharts';

interface BalanceChartProps {
  transactions: Transaction[];
}

const BalanceChart: React.FC<BalanceChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    let runningBalance = 0;
    const balanceByDate = new Map();

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate running balance
    sortedTransactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      balanceByDate.set(transaction.date, runningBalance);
    });

    // Create data for each day
    return last30Days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      let balance = balanceByDate.get(dateStr);
      
      // If no transaction on this day, find the last known balance
      if (balance === undefined) {
        const previousDates = Array.from(balanceByDate.keys()).filter(
          (d) => d <= dateStr
        );
        if (previousDates.length > 0) {
          const lastDate = previousDates[previousDates.length - 1];
          balance = balanceByDate.get(lastDate);
        } else {
          balance = 0;
        }
      }
      
      return {
        date: format(day, 'MMM dd'),
        balance: balance || 0,
      };
    });
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for the selected period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          tick={{ fill: '#6b7280' }}
          tickLine={{ stroke: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fill: '#6b7280' }}
          tickLine={{ stroke: '#6b7280' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value: any) => [`$${value}`, 'Balance']}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          fill="url(#colorBalance)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default BalanceChart;