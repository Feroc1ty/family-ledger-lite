import { useMemo } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { formatCurrency, getMonthIndex } from "@/utils/budgetCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PiggyBank } from "lucide-react";

const Savings = () => {
  const { expenses } = useBudgetData();

  const savingsGoals = useMemo(() => {
    const currentMonth = new Date().getMonth();

    return expenses
      .filter((expense) => expense.type !== "monthly")
      .map((expense) => {
        let monthsUntilDue = 0;
        let monthlySaving = 0;

        if (expense.type === "yearly" && expense.dueMonth) {
          const dueIndex = getMonthIndex(expense.dueMonth);
          monthsUntilDue =
            dueIndex >= currentMonth
              ? dueIndex - currentMonth
              : 12 - currentMonth + dueIndex;
          monthlySaving = monthsUntilDue > 0 ? expense.amount / monthsUntilDue : expense.amount;
        } else if (expense.type === "quarterly") {
          const startIndex = getMonthIndex(expense.startMonth);
          const monthsSinceStart = currentMonth - startIndex;
          const nextPaymentMonths = 3 - (monthsSinceStart % 3);
          monthsUntilDue = nextPaymentMonths;
          monthlySaving = expense.amount / 3;
        }

        return {
          ...expense,
          monthsUntilDue,
          monthlySaving,
        };
      })
      .sort((a, b) => a.monthsUntilDue - b.monthsUntilDue);
  }, [expenses]);

  const totalMonthlySavings = savingsGoals.reduce(
    (sum, goal) => sum + goal.monthlySaving,
    0
  );

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Накопления</h2>
        <p className="text-muted-foreground">
          Цели и планы накоплений на будущие расходы
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <PiggyBank className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Рекомендуется откладывать ежемесячно
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(totalMonthlySavings)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Цели накоплений</CardTitle>
        </CardHeader>
        <CardContent>
          {savingsGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет целей для накоплений</p>
              <p className="text-sm mt-1">
                Добавьте периодические или годовые расходы
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Цель / Расход</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead className="text-right">Итого нужно</TableHead>
                    <TableHead className="text-right">Осталось месяцев</TableHead>
                    <TableHead className="text-right">
                      Ежемесячно откладывать
                    </TableHead>
                    <TableHead className="text-right">Дата платежа</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savingsGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.title}</TableCell>
                      <TableCell>{goal.category}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(goal.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {goal.monthsUntilDue}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-warning">
                        {formatCurrency(goal.monthlySaving)}
                      </TableCell>
                      <TableCell className="text-right">
                        {goal.dueMonth || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Savings;
