import { useMemo, useState } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { getMonthName, formatCurrency } from "@/utils/budgetCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, ExpenseCategory } from "@/types/budget";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryMonthData {
  category: ExpenseCategory;
  monthIndex: number;
  monthName: string;
  total: number;
  expenses: {
    expense: Expense;
    amount: number;
  }[];
}

const ExpenseCalendar = () => {
  const { expenses } = useBudgetData();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCell, setSelectedCell] = useState<CategoryMonthData | null>(null);

  const categories: ExpenseCategory[] = [
    "Еда",
    "Авто",
    "Коммунальные",
    "Развлечения",
    "Подарки",
    "Дети",
    "Налоги",
    "Подписки",
    "Прочее",
  ];

  const heatmapData = useMemo(() => {
    const result: CategoryMonthData[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    categories.forEach((category) => {
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthName = getMonthName(monthIndex);
        const cellData: CategoryMonthData = {
          category,
          monthIndex,
          monthName,
          total: 0,
          expenses: [],
        };

        expenses
          .filter((expense) => expense.category === category)
          .forEach((expense) => {
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
              cellData.expenses.push({ expense, amount });
              cellData.total += amount;
            }
          });

        result.push(cellData);
      }
    });

    return result;
  }, [expenses, selectedYear, categories]);

  const maxAmount = useMemo(() => {
    return Math.max(...heatmapData.map((d) => d.total), 1);
  }, [heatmapData]);

  const getHeatmapColor = (amount: number) => {
    if (amount === 0) return "bg-muted/30";
    const intensity = Math.min(amount / maxAmount, 1);
    
    if (intensity < 0.2) return "bg-destructive/20";
    if (intensity < 0.4) return "bg-destructive/40";
    if (intensity < 0.6) return "bg-destructive/60";
    if (intensity < 0.8) return "bg-destructive/80";
    return "bg-destructive";
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
    if (!selectedCell) return [];
    return selectedCell.expenses.map(({ expense, amount }) => ({
      name: expense.title,
      value: amount,
      category: expense.category,
    }));
  }, [selectedCell]);

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Тепловая карта расходов</h2>
          <p className="text-muted-foreground">
            Визуализация расходов по категориям и месяцам
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

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header with month names */}
              <div className="flex mb-2">
                <div className="w-32 flex-shrink-0" />
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="w-20 text-center text-xs font-medium text-muted-foreground flex-shrink-0"
                  >
                    {getMonthName(i).slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {categories.map((category) => (
                <div key={category} className="flex items-center mb-1">
                  <div className="w-32 text-sm font-medium pr-4 flex-shrink-0">
                    {category}
                  </div>
                  {Array.from({ length: 12 }, (_, monthIndex) => {
                    const cellData = heatmapData.find(
                      (d) => d.category === category && d.monthIndex === monthIndex
                    );
                    const amount = cellData?.total || 0;

                    return (
                      <div
                        key={monthIndex}
                        className={`w-20 h-12 flex items-center justify-center cursor-pointer rounded border border-border transition-all hover:scale-105 hover:shadow-md flex-shrink-0 ${getHeatmapColor(
                          amount
                        )}`}
                        onClick={() => cellData && setSelectedCell(cellData)}
                      >
                        {amount > 0 && (
                          <span className="text-xs font-semibold">
                            {(amount / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
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
      <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCell?.category} - {selectedCell?.monthName}
            </DialogTitle>
          </DialogHeader>

          {selectedCell && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Общая сумма</p>
                <p className="text-3xl font-bold text-destructive">
                  {formatCurrency(selectedCell.total)}
                </p>
              </div>

              {selectedCell.expenses.length > 0 && (
                <>
                  {/* Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getCategoryColor(entry.category)}
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

                  {/* Detailed list */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Детализация расходов</h3>
                    {selectedCell.expenses.map(({ expense, amount }, index) => (
                      <div
                        key={`${expense.id}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.type === "daily" && "Ежедневный"}
                            {expense.type === "weekly" && "Еженедельный"}
                            {expense.type === "monthly" && "Ежемесячный"}
                            {expense.type === "quarterly" && "Раз в 3 месяца"}
                            {expense.type === "yearly" && "Раз в год"}
                            {expense.type === "custom" && "Пользовательский"}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-destructive">
                          {formatCurrency(amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedCell.expenses.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Нет расходов в этой категории за выбранный месяц
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