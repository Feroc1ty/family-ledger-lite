import { FamilyMember, Expense, BudgetMonth } from "@/types/budget";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

export const getMonthIndex = (monthName: string): number => {
  return MONTHS.indexOf(monthName);
};

export const getMonthName = (index: number): string => {
  return MONTHS[index];
};

export const calculateTotalIncome = (
  familyMembers: FamilyMember[],
  monthIndex: number
): number => {
  return familyMembers.reduce((total, member) => {
    if (member.startMonth) {
      const startIndex = getMonthIndex(member.startMonth);
      if (monthIndex < startIndex) return total;
    }
    return total + member.monthlyIncome;
  }, 0);
};

export const calculateMonthlyExpenses = (expenses: Expense[]): number => {
  return expenses
    .filter(expense => expense.type === "monthly" || expense.type === "daily" || expense.type === "weekly")
    .reduce((total, expense) => {
      if (expense.type === "daily") {
        return total + (expense.amount * 30.44); // Average days per month
      } else if (expense.type === "weekly") {
        return total + (expense.amount * 4.33); // Average weeks per month
      }
      return total + expense.amount;
    }, 0);
};

export const calculatePlannedExpenses = (
  expenses: Expense[],
  currentMonthIndex: number
): number => {
  let total = 0;

  expenses.forEach(expense => {
    if (expense.type === "monthly") return;

    const startIndex = getMonthIndex(expense.startMonth);
    if (currentMonthIndex < startIndex) return;

    if (expense.type === "quarterly") {
      // Check if this is a payment month (every 3 months from start)
      const monthsSinceStart = currentMonthIndex - startIndex;
      if (monthsSinceStart % 3 === 0) {
        total += expense.amount;
      }
    } else if (expense.type === "yearly" && expense.dueMonth) {
      const dueIndex = getMonthIndex(expense.dueMonth);
      const monthsUntilDue = dueIndex >= currentMonthIndex 
        ? dueIndex - currentMonthIndex 
        : 12 - currentMonthIndex + dueIndex;
      
      if (monthsUntilDue === 0) {
        total += expense.amount;
      } else if (monthsUntilDue > 0) {
        total += expense.amount / (monthsUntilDue + 1);
      }
    } else if (expense.type === "custom" && expense.customPeriodMonths && expense.dueMonth) {
      const dueIndex = getMonthIndex(expense.dueMonth);
      const monthsSinceStart = currentMonthIndex - startIndex;
      if (monthsSinceStart % expense.customPeriodMonths === 0 && currentMonthIndex === dueIndex) {
        total += expense.amount;
      }
    }
  });

  return total;
};

export const calculateYearlyBudget = (
  familyMembers: FamilyMember[],
  expenses: Expense[]
): BudgetMonth[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  return MONTHS.map((monthName, index) => {
    const totalIncome = calculateTotalIncome(familyMembers, index);
    const regularExpenses = calculateMonthlyExpenses(expenses);
    const plannedExpenses = calculatePlannedExpenses(expenses, index);
    const totalExpenses = regularExpenses + plannedExpenses;
    const balance = totalIncome - totalExpenses;

    return {
      monthName,
      monthIndex: index,
      totalIncome,
      regularExpenses,
      plannedExpenses,
      totalExpenses,
      balance,
    };
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
};
