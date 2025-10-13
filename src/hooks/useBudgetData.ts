import { useState, useEffect } from "react";
import { FamilyMember, Expense, SavingsGoal } from "@/types/budget";

const STORAGE_KEYS = {
  FAMILY_MEMBERS: "budget_family_members",
  EXPENSES: "budget_expenses",
  SAVINGS_GOALS: "budget_savings_goals",
};

export const useBudgetData = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
    return stored ? JSON.parse(stored) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return stored ? JSON.parse(stored) : [];
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const addFamilyMember = (member: Omit<FamilyMember, "id">) => {
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, ...updates } : member))
    );
  };

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((expense) => (expense.id === id ? { ...expense, ...updates } : expense))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, "id">) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return {
    familyMembers,
    expenses,
    savingsGoals,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    addExpense,
    updateExpense,
    deleteExpense,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  };
};
