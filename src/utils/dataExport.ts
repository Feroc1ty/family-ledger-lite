const STORAGE_KEYS = {
  FAMILY_MEMBERS: "budget_family_members",
  EXPENSES: "budget_expenses",
  SAVINGS_GOALS: "budget_savings_goals",
};

export const exportData = () => {
  const data = {
    familyMembers: localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS),
    expenses: localStorage.getItem(STORAGE_KEYS.EXPENSES),
    savingsGoals: localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS),
    exportDate: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `family-budget-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
