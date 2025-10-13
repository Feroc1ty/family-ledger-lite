export interface FamilyMember {
  id: string;
  name: string;
  monthlyIncome: number;
  startMonth?: string;
}

export type ExpenseType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export type ExpenseCategory = 
  | "Еда" 
  | "Авто" 
  | "Коммунальные" 
  | "Развлечения" 
  | "Подарки"
  | "Прочее";

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount?: number;
  monthlySaving?: number;
  targetDate?: string;
  currentAmount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  dueMonth?: string;
  startMonth: string;
  customPeriodMonths?: number;
  dayOfWeek?: string;
}

export interface BudgetMonth {
  monthName: string;
  monthIndex: number;
  totalIncome: number;
  regularExpenses: number;
  plannedExpenses: number;
  savingsGoals: number;
  totalExpenses: number;
  balance: number;
}
