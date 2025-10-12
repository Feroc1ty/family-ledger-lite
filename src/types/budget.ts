export interface FamilyMember {
  id: string;
  name: string;
  monthlyIncome: number;
  startMonth?: string;
}

export type ExpenseType = "monthly" | "quarterly" | "yearly" | "custom";

export type ExpenseCategory = 
  | "Еда" 
  | "Авто" 
  | "Коммунальные" 
  | "Развлечения" 
  | "Прочее";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  dueMonth?: string;
  startMonth: string;
  customPeriodMonths?: number;
}

export interface BudgetMonth {
  monthName: string;
  monthIndex: number;
  totalIncome: number;
  regularExpenses: number;
  plannedExpenses: number;
  totalExpenses: number;
  balance: number;
}
