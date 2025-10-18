import { useMemo, useState } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { getMonthName, formatCurrency } from "@/utils/budgetCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, ExpenseCategory } from "@/types/budget";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MonthData {
  monthName: string;
  monthIndex: number;
  total: number;
  expenses: {
    expense: Expense;
    amount: number;
  }[];
  categorySummary: {
    category: ExpenseCategory;
    total: number;
  }[];
}

const ExpenseCalendar = () => {
  const { expenses } = useBudgetData();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);

  const monthlyData = useMemo(() => {
    const result: MonthData[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthName = getMonthName(monthIndex);
      const monthData: MonthData = {
        monthName,
        monthIndex,
        total: 0,
        expenses: [],
        categorySummary: [],
      };

      const categoryTotals = new Map<ExpenseCategory, number>();

      expenses.forEach((expense) => {
        const startMonthIndex = expense.startMonth
          ? Array.from({ length: 12 }, (_, i) => getMonthName(i)).indexOf(expense.startMonth)
          : 0;

        if (selectedYear < currentYear) {
          // Past years - show all expenses
        } else if (selectedYear === currentYear) {
          if (monthIndex < startMonthIndex) return;
        } else {
          const yearsSinceStart = selectedYear - currentYear;
          const monthsSinceStart = yearsSinceStart * 12 + monthIndex - startMonthIndex;
          if (monthsSinceStart < 0 && currentMonth < startMonthIndex) return;
        }

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
              const dueMonthIndex = Array.from({ length: 12 }, (_, i) =>
                getMonthName(i)
              ).indexOf(expense.dueMonth);
              shouldInclude = monthIndex === dueMonthIndex;
            }
            break;
          case "custom":
            if (expense.customPeriodMonths) {
              shouldInclude =
                (monthIndex - startMonthIndex) % expense.customPeriodMonths === 0;
            }
            break;
        }

        if (shouldInclude) {
          monthData.expenses.push({ expense, amount });
          monthData.total += amount;

          const currentCategoryTotal = categoryTotals.get(expense.category) || 0;
          categoryTotals.set(expense.category, currentCategoryTotal + amount);
        }
      });

      monthData.categorySummary = Array.from(categoryTotals.entries()).map(
        ([category, total]) => ({ category, total })
      );

      result.push(monthData);
    }

    return result;
  }, [expenses, selectedYear]);

  const { minAmount, maxAmount } = useMemo(() => {
    const amounts = monthlyData.map((d) => d.total).filter(a => a > 0);
    if (amounts.length === 0) return { minAmount: 0, maxAmount: 1 };
    return {
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts)
    };
  }, [monthlyData]);

  const getHeatmapColor = (amount: number) => {
    if (amount === 0) return "bg-muted/30 hover:bg-muted/50";
    
    // Normalize between minAmount and maxAmount
    const range = maxAmount - minAmount;
    if (range === 0) return "bg-destructive/20 hover:bg-destructive/30";
    
    const normalized = (amount - minAmount) / range;
    const intensity = Math.min(Math.max(normalized, 0), 1);
    
    // Month with minimum expense - no/minimal highlight
    if (intensity < 0.15) return "bg-muted/50 hover:bg-muted/60";
    // Gradual increase in red intensity
    if (intensity < 0.3) return "bg-destructive/20 hover:bg-destructive/30";
    if (intensity < 0.5) return "bg-destructive/35 hover:bg-destructive/45";
    if (intensity < 0.7) return "bg-destructive/50 hover:bg-destructive/60";
    if (intensity < 0.85) return "bg-destructive/65 hover:bg-destructive/75";
    // Month with maximum expense - light red
    return "bg-destructive/80 hover:bg-destructive/90";
  };

  const getCategoryColor = (category: ExpenseCategory): string => {
    const colors: Record<ExpenseCategory, string> = {
      "Еда": "hsl(210, 60%, 55%)",
      "Авто": "hsl(280, 60%, 60%)",
      "Коммунальные": "hsl(123, 46%, 45%)",
      "Развлечения": "hsl(340, 75%, 55%)",
      "Подарки": "hsl(29, 100%, 48%)",
      "Дети": "hsl(180, 60%, 50%)",
      "Налоги": "hsl(0, 60%, 50%)",
      "Подписки": "hsl(260, 60%, 55%)",
      "Прочее": "hsl(210, 10%, 45%)",
    };
    return colors[category];
  };

  const pieChartData = useMemo(() => {
    if (!selectedMonth) return [];
    return selectedMonth.categorySummary.map(({ category, total }) => ({
      name: category,
      value: total,
    }));
  }, [selectedMonth]);

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Тепловая карта расходов</h2>
          <p className="text-muted-foreground">
            Визуализация расходов по месяцам
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear(selectedYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-2xl font-bold min-w-[100px] text-center">
            {selectedYear}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear(selectedYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {monthlyData.map((month) => (
          <Card
            key={month.monthIndex}
            className={`cursor-pointer transition-all ${getHeatmapColor(
              month.total
            )}`}
            onClick={() => setSelectedMonth(month)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{month.monthName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(month.total)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {month.expenses.length} {month.expenses.length === 1 ? "расход" : "расходов"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Низкие расходы</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-destructive/20 rounded border border-border" />
              <div className="w-4 h-4 bg-destructive/40 rounded border border-border" />
              <div className="w-4 h-4 bg-destructive/60 rounded border border-border" />
              <div className="w-4 h-4 bg-destructive/80 rounded border border-border" />
              <div className="w-4 h-4 bg-destructive rounded border border-border" />
            </div>
            <span>Высокие расходы</span>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMonth} onOpenChange={(open) => !open && setSelectedMonth(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedMonth?.monthName} {selectedYear}
            </DialogTitle>
          </DialogHeader>

          {selectedMonth && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Общая сумма расходов</p>
                <p className="text-4xl font-bold text-destructive">
                  {formatCurrency(selectedMonth.total)}
                </p>
              </div>

              {selectedMonth.categorySummary.length > 0 && (
                <>
                  {/* Pie Chart - Categories */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Расходы по категориям</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) =>
                              percent > 0.08 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={getCategoryColor(
                                  selectedMonth.categorySummary[index].category
                                )}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Detailed list */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Все расходы</h3>
                    {selectedMonth.expenses
                      .sort((a, b) => b.amount - a.amount)
                      .map(({ expense, amount }, index) => (
                        <div
                          key={`${expense.id}-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{expense.title}</p>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: getCategoryColor(expense.category) + "33",
                                  color: getCategoryColor(expense.category),
                                }}
                              >
                                {expense.category}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {expense.type === "daily" && "Ежедневный"}
                              {expense.type === "weekly" && "Еженедельный"}
                              {expense.type === "monthly" && "Ежемесячный"}
                              {expense.type === "quarterly" && "Раз в 3 месяца"}
                              {expense.type === "yearly" && "Раз в год"}
                              {expense.type === "custom" && "Пользовательский"}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-destructive ml-4">
                            {formatCurrency(amount)}
                          </p>
                        </div>
                      ))}
                  </div>
                </>
              )}

              {selectedMonth.expenses.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Нет расходов за этот месяц
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseCalendar;