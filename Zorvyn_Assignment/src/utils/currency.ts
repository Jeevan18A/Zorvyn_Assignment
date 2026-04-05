/**
 * Currency formatting utilities
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 100000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};
