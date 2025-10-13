import { useMemo, useState } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { getMonthName, formatCurrency } from "@/utils/budgetCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/types/budget";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthExpenses {
  monthName: string;
  monthIndex: number;
  expenses: {
    expense: Expense;
    amount: number;
  }[];
  total: number;
}

const ExpenseCalendar = () => {
  const { expenses } = useBudgetData();
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([new Date().getMonth()]));

  const monthlyExpenses = useMemo(() => {
    const result: MonthExpenses[] = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthName = getMonthName(monthIndex);
      const monthExpenses: MonthExpenses = {
        monthName,
        monthIndex,
        expenses: [],
        total: 0,
      };

      expenses.forEach((expense) => {
        const startMonthIndex = expense.startMonth
          ? Array.from({ length: 12 }, (_, i) => getMonthName(i)).indexOf(expense.startMonth)
          : 0;

        if (monthIndex < startMonthIndex) return;

        let shouldInclude = false;
        let amount = expense.amount;

        switch (expense.type) {
          case "daily":
            shouldInclude = true;
            amount = expense.amount * 30.44;
            break;
          case "weekly":
            shouldInclude = true;
            amount = expense.amount * 4.33;
            break;
          case "monthly":
            shouldInclude = true;
            break;
          case "quarterly":
            shouldInclude = (monthIndex - startMonthIndex) % 3 === 0;
            break;
          case "yearly":
            if (expense.dueMonth) {
              const dueMonthIndex = Array.from({ length: 12 }, (_, i) => getMonthName(i)).indexOf(expense.dueMonth);
              shouldInclude = monthIndex === dueMonthIndex;
            }
            break;
          case "custom":
            if (expense.customPeriodMonths) {
              shouldInclude = (monthIndex - startMonthIndex) % expense.customPeriodMonths === 0;
            }
            break;
        }

        if (shouldInclude) {
          monthExpenses.expenses.push({ expense, amount });
          monthExpenses.total += amount;
        }
      });

      result.push(monthExpenses);
    }

    return result;
  }, [expenses]);

  const toggleMonth = (monthIndex: number) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthIndex)) {
        newSet.delete(monthIndex);
      } else {
        newSet.add(monthIndex);
      }
      return newSet;
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: "Ежедневный",
      weekly: "Еженедельный",
      monthly: "Ежемесячный",
      quarterly: "Раз в 3 месяца",
      yearly: "Раз в год",
      custom: "Пользовательский",
    };
    return labels[type] || type;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Еда": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Авто": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Коммунальные": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Развлечения": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "Прочее": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };
    return colors[category] || colors["Прочее"];
  };

  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Календарь расходов</h2>
        <p className="text-muted-foreground">
          Детальный просмотр расходов по месяцам
        </p>
      </div>

      <div className="grid gap-4">
        {monthlyExpenses.map((month) => (
          <Card key={month.monthIndex} className={month.monthIndex === currentMonth ? "border-primary" : ""}>
            <CardHeader className="cursor-pointer" onClick={() => toggleMonth(month.monthIndex)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">
                    {month.monthName}
                    {month.monthIndex === currentMonth && (
                      <span className="ml-2 text-sm text-primary font-normal">
                        (текущий месяц)
                      </span>
                    )}
                  </CardTitle>
                  <Badge variant={month.expenses.length > 0 ? "default" : "secondary"}>
                    {month.expenses.length} {month.expenses.length === 1 ? "расход" : "расходов"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-destructive">
                    {formatCurrency(month.total)}
                  </span>
                  <Button variant="ghost" size="sm">
                    {expandedMonths.has(month.monthIndex) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedMonths.has(month.monthIndex) && (
              <CardContent>
                {month.expenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Нет запланированных расходов
                  </p>
                ) : (
                  <div className="space-y-3">
                    {month.expenses.map(({ expense, amount }, index) => (
                      <div
                        key={`${expense.id}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{expense.title}</h4>
                            <Badge className={getCategoryColor(expense.category)} variant="secondary">
                              {expense.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{getTypeLabel(expense.type)}</span>
                            {expense.type === "weekly" && expense.dayOfWeek && (
                              <span>• {expense.dayOfWeek}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-destructive">
                            {formatCurrency(amount)}
                          </p>
                          {expense.type === "daily" && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(expense.amount)} × 30.44 дней
                            </p>
                          )}
                          {expense.type === "weekly" && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(expense.amount)} × 4.33 недели
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExpenseCalendar;