import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getSummary, 
  getInsights,
  type Summary,
  type Insights
} from '../features/finance/financeApi';

const transactionsToCSV = (transactions: Transaction[]): string => {
  const headers = ['ID', 'Date', 'Amount', 'Category', 'Type', 'Description'];
  const rows = transactions.map(t => [
    t.id,
    t.date,
    t.amount.toString(),
    t.category,
    t.type,
    t.description || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description?: string;
}

export type Role = 'admin' | 'viewer';

interface AppState {
  transactions: Transaction[];
  role: Role;
  darkMode: boolean;
  filters: {
    search: string;
    type: 'all' | 'income' | 'expense';
    category: string;
    dateRange: {
      start: string;
      end: string;
    };
    groupBy?: 'none' | 'category' | 'month' | 'week';
  };
  
  // API Data
  summary: Summary | null;
  insights: Insights | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setRole: (role: Role) => void;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  resetFilters: () => void;
  exportData: (format: 'csv' | 'json') => void;
  importData: (data: Transaction[]) => void;
  clearAllData: () => void;
  
  // API Actions
  fetchTransactions: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeData: () => Promise<void>;
}

const defaultFilters = {
  search: '',
  type: 'all' as const,
  category: '',
  dateRange: {
    start: '',
    end: '',
  },
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: [],
      role: 'admin',
      darkMode: false,
      filters: defaultFilters,
      summary: null,
      insights: null,
      loading: false,
      error: null,

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              id: Date.now().toString(),
            },
          ],
        })),

      editTransaction: (id, updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setRole: (role) => set({ role }),
      
      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
      },
      
      setDarkMode: (darkMode) => {
        set({ darkMode });
      },
      
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
        
      resetFilters: () =>
        set({ filters: defaultFilters }),
      
      exportData: (format) => {
        const { transactions } = get();
        const dataStr = format === 'csv' 
          ? transactionsToCSV(transactions)
          : JSON.stringify(transactions, null, 2);
        
        const blob = new Blob([dataStr], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      
      importData: (data) => set({ transactions: data }),
      
      clearAllData: () => set({ transactions: [] }),

      // API Actions
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      fetchTransactions: async () => {
        try {
          set({ loading: true, error: null });
          console.log('Store: Fetching transactions...');
          
          // Check if we already have transactions in state (from localStorage)
          const currentState = get();
          if (currentState.transactions.length > 0) {
            console.log('Store: Using existing transactions from localStorage:', currentState.transactions.length);
            set({ loading: false });
            return;
          }
          
          // Only load mock data if no existing data
          console.log('Store: No existing data, loading mock data');
          const { mockTransactions } = await import('../data/mockData');
          console.log('Store: Mock data loaded:', mockTransactions.length);
          
          // Transform API response to match frontend format
          const transformedTransactions = mockTransactions.map((t: any) => {
            // Handle API format with negative amounts for expenses
            if (t.amount < 0) {
              return {
                ...t,
                amount: Math.abs(t.amount),
                type: 'expense' as const,
                description: t.description || t.note || ''
              };
            } else {
              return {
                ...t,
                type: 'income' as const,
                description: t.description || t.note || ''
              };
            }
          });
          
          set({ 
            transactions: transformedTransactions,
            loading: false 
          });
          
          /* Commented out API call for testing
          const response = await getTransactions();
          console.log('Store: API Response:', response); // Debug log
          
          // Handle different response structures
          let transactions = [];
          if (Array.isArray(response)) {
            // Direct array response
            transactions = response;
          } else if (response && Array.isArray((response as any).items)) {
            // Response with items property
            transactions = (response as any).items;
          } else if (response && Array.isArray((response as any).transactions)) {
            // Response with transactions property (Postman mock API)
            transactions = (response as any).transactions;
          } else if (response && Array.isArray((response as any).data)) {
            // Response with data property
            transactions = (response as any).data;
          } else {
            console.warn('Store: Unexpected API response structure:', response);
            // If API fails, use mock data as fallback
            console.log('Store: Using mock data as fallback');
            const { mockTransactions } = await import('../data/mockData');
            transactions = mockTransactions;
          }
          
          console.log('Store: Setting transactions:', transactions.length);
          // Transform API response to match frontend format
          const transformedTransactions = transactions.map((t: any) => {
            // Handle API format with negative amounts for expenses
            if (t.amount < 0) {
              return {
                ...t,
                amount: Math.abs(t.amount),
                type: 'expense' as const,
                description: t.description || t.note || ''
              };
            } else {
              return {
                ...t,
                type: 'income' as const,
                description: t.description || t.note || ''
              };
            }
          });
          
          set({ 
            transactions: transformedTransactions,
            loading: false 
          });
          */
        } catch (error) {
          console.error('Store: Fetch transactions error:', error);
          // Use mock data as fallback
          try {
            const { mockTransactions } = await import('../data/mockData');
            console.log('Store: Using mock data due to error:', mockTransactions.length);
            set({ 
              transactions: mockTransactions,
              error: null,
              loading: false 
            });
          } catch (fallbackError) {
            console.error('Store: Fallback also failed:', fallbackError);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch transactions',
              loading: false 
            });
          }
        }
      },

      initializeData: async () => {
        const { transactions } = get();
        if (transactions.length === 0) {
          console.log('Store: No transactions found, loading mock data...');
          try {
            const { mockTransactions } = await import('../data/mockData');
            set({ 
              transactions: mockTransactions,
              error: null,
              loading: false 
            });
            console.log('Store: Mock data loaded successfully');
          } catch (error) {
            console.error('Store: Failed to load mock data:', error);
          }
        }
      },

      fetchSummary: async () => {
        try {
          set({ loading: true, error: null });
          const summary = await getSummary();
          console.log('Summary API Response:', summary);
          set({ summary, loading: false });
        } catch (error) {
          console.error('Fetch summary error:', error);
          // Calculate summary from local transactions as fallback
          const { transactions } = get();
          const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const fallbackSummary = {
            totalBalance: income - expenses,
            income,
            expenses,
            currency: 'USD',
            balanceTrend: [],
            spendingBreakdown: []
          };
          
          set({ 
            summary: fallbackSummary, 
            loading: false 
          });
        }
      },

      fetchInsights: async () => {
        try {
          set({ loading: true, error: null });
          const insights = await getInsights();
          console.log('Insights API Response:', insights);
          set({ insights, loading: false });
        } catch (error) {
          console.error('Fetch insights error:', error);
          // Create fallback insights
          const fallbackInsights = {
            highestSpendingCategory: { category: 'N/A', amount: 0 },
            monthOverMonth: {
              currentMonthExpenses: 0,
              previousMonthExpenses: 0,
              changePercent: 0
            },
            observations: ['API insights unavailable - using local data']
          };
          
          set({ 
            insights: fallbackInsights, 
            loading: false 
          });
        }
      },

      createTransaction: async (transaction) => {
        try {
          set({ loading: true, error: null });
          
          // Create new transaction with unique ID
          const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
          };
          
          // Add to local state
          set((state) => ({
            transactions: [...state.transactions, newTransaction],
            loading: false
          }));
          
          console.log('Store: Transaction created successfully:', newTransaction);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create transaction',
            loading: false 
          });
        }
      },

      updateTransaction: async (id, transaction) => {
        try {
          set({ loading: true, error: null });
          
          // Update transaction in local state
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...transaction } : t
            ),
            loading: false
          }));
          
          console.log('Store: Transaction updated successfully:', id, transaction);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update transaction',
            loading: false 
          });
        }
      },

      removeTransaction: async (id) => {
        try {
          set({ loading: true, error: null });
          
          // Remove transaction from local state
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
            loading: false
          }));
          
          console.log('Store: Transaction deleted successfully:', id);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete transaction',
            loading: false 
          });
        }
      },
    }),
    {
      name: 'finance-dashboard',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
