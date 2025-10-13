import { useMemo } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { calculateYearlyBudget, formatCurrency } from "@/utils/budgetCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const Planning = () => {
  const { familyMembers, expenses, savingsGoals } = useBudgetData();

  const yearlyBudget = useMemo(
    () => calculateYearlyBudget(familyMembers, expenses, savingsGoals),
    [familyMembers, expenses, savingsGoals]
  );

  const averageBalance = useMemo(() => {
    return yearlyBudget.reduce((sum, month) => sum + month.balance, 0) / 12;
  }, [yearlyBudget]);

  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Планирование</h2>
        <p className="text-muted-foreground">
          Финансовый план на весь год
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бюджет по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Месяц</TableHead>
                  <TableHead className="text-right">Доход</TableHead>
                  <TableHead className="text-right">Обязательные</TableHead>
                  <TableHead className="text-right">Отложенные</TableHead>
                  <TableHead className="text-right">Цели</TableHead>
                  <TableHead className="text-right">Всего расходов</TableHead>
                  <TableHead className="text-right">Остаток</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyBudget.map((month) => (
                  <TableRow
                    key={month.monthName}
                    className={cn(
                      month.monthIndex === currentMonth && "bg-secondary/50"
                    )}
                  >
                    <TableCell className="font-medium">
                      {month.monthName}
                      {month.monthIndex === currentMonth && (
                        <span className="ml-2 text-xs text-primary">
                          (текущий)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-success">
                      {formatCurrency(month.totalIncome)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(month.regularExpenses)}
                    </TableCell>
                    <TableCell className="text-right text-warning">
                      {formatCurrency(month.plannedExpenses)}
                    </TableCell>
                    <TableCell className="text-right text-primary">
                      {formatCurrency(month.savingsGoals)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(month.totalExpenses)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        month.balance >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {formatCurrency(month.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                Средний остаток в месяц:
              </span>
              <span
                className={cn(
                  "text-3xl font-bold",
                  averageBalance >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {formatCurrency(averageBalance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Planning;
