import { apiGet, apiSend } from "../../lib/apiClient";

export type TxnType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  type: TxnType;
  note?: string;
};

export type Summary = {
  totalBalance: number;
  income: number;
  expenses: number;
  currency: string;
  balanceTrend: { date: string; balance: number }[];
  spendingBreakdown: { category: string; amount: number }[];
};

export type Insights = {
  highestSpendingCategory: { category: string; amount: number };
  monthOverMonth: {
    currentMonthExpenses: number;
    previousMonthExpenses: number;
    changePercent: number;
  };
  observations: string[];
};

export async function getSummary() {
  return apiGet<Summary>("/summary");
}

export async function getTransactions(params?: {
  search?: string;
  type?: TxnType;
  category?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: "asc" | "desc";
}) {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  return apiGet<{ items: Transaction[]; total: number }>(`/transactions${qs}`);
}

export async function createTransaction(input: Omit<Transaction, "id">) {
  return apiSend<Transaction>("POST", "/transactions", input);
}

export async function updateTransaction(id: string, patch: Partial<Transaction>) {
  return apiSend<Transaction>("PATCH", `/transactions/${id}`, patch);
}

export async function deleteTransaction(id: string) {
  return apiSend<void>("DELETE", `/transactions/${id}`);
}

export async function getInsights() {
  return apiGet<Insights>("/insights");
}
