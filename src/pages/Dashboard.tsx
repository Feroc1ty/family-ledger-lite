import { useMemo } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { calculateYearlyBudget } from "@/utils/budgetCalculations";
import BalanceCard from "@/components/BalanceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Calendar, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { familyMembers, expenses, savingsGoals } = useBudgetData();
  
  const yearlyBudget = useMemo(
    () => calculateYearlyBudget(familyMembers, expenses, savingsGoals),
    [familyMembers, expenses, savingsGoals]
  );

  const currentMonth = new Date().getMonth();
  const currentMonthData = yearlyBudget[currentMonth];

  const recommendedSavings = useMemo(() => {
    const futureExpenses = expenses.filter(
      (exp) => exp.type === "yearly" || exp.type === "quarterly"
    );
    const totalFutureExpenses = futureExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    return totalFutureExpenses / 12;
  }, [expenses]);

  const hasDeficit = yearlyBudget.some((month) => month.balance < 0);
  const deficitMonths = yearlyBudget.filter((month) => month.balance < 0);

  const chartData = useMemo(() => {
    return yearlyBudget.map((month) => ({
      month: month.monthName.slice(0, 3), // Сокращённое название месяца
      доходы: month.totalIncome,
      расходы: month.regularExpenses + month.plannedExpenses + month.savingsGoals,
      остаток: month.balance,
    }));
  }, [yearlyBudget]);

  return (
    <div className="space-y-8 animate-slide-up pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Финансовая панель</h2>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("ru-RU", { 
            month: "long", 
            year: "numeric" 
          })}
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <BalanceCard
          title="Общий доход"
          amount={currentMonthData.totalIncome}
          description="За текущий месяц"
          variant="success"
        />
        <BalanceCard
          title="Обязательные расходы"
          amount={currentMonthData.regularExpenses}
          description="Ежемесячные траты"
        />
        <BalanceCard
          title="Отложенные расходы"
          amount={currentMonthData.plannedExpenses}
          description="Накопления на будущее"
          variant="warning"
        />
        <BalanceCard
          title="Откладываем на цели"
          amount={currentMonthData.savingsGoals}
          description="Накопления на цели"
          variant="warning"
        />
        <BalanceCard
          title="Остаток"
          amount={currentMonthData.balance}
          description="Свободные средства"
          variant={currentMonthData.balance >= 0 ? "success" : "destructive"}
        />
      </div>

      {/* Yearly Dynamics Chart */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Годовая динамика доходов и расходов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('ru-RU', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) =>
                    new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="доходы"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 76%, 36%)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="расходы"
                  stroke="hsl(0, 84%, 60%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(0, 84%, 60%)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="остаток"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(217, 91%, 60%)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Insights */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Средний доход</p>
              <p className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  maximumFractionDigits: 0,
                }).format(
                  yearlyBudget.reduce((sum, m) => sum + m.totalIncome, 0) / 12
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-muted-foreground mb-1">Средние расходы</p>
              <p className="text-lg font-bold text-red-600">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  maximumFractionDigits: 0,
                }).format(
                  yearlyBudget.reduce(
                    (sum, m) => sum + m.regularExpenses + m.plannedExpenses + m.savingsGoals, 
                    0
                  ) / 12
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-1">Средний остаток</p>
              <p className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  maximumFractionDigits: 0,
                }).format(
                  yearlyBudget.reduce((sum, m) => sum + m.balance, 0) / 12
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium mb-1">Рекомендовано откладывать каждый месяц</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  maximumFractionDigits: 0,
                }).format(recommendedSavings)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Это сумма для ежемесячного откладывания, которая поможет покрыть ваши квартальные и годовые расходы. 
                Откладывая эту сумму каждый месяц, вы будете готовы к крупным тратам в течение года.
              </p>
            </div>
            {currentMonthData.balance > recommendedSavings && (
              <p className="text-sm text-success flex items-center gap-2">
                <span className="text-lg">✓</span>
                У вас достаточно средств для накоплений
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-warning" />
              Предупреждения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasDeficit ? (
              <>
                {deficitMonths.map((month) => (
                  <div
                    key={month.monthName}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-sm font-medium text-destructive flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {month.monthName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Дефицит: {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        maximumFractionDigits: 0,
                      }).format(Math.abs(month.balance))}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-success flex items-center gap-2">
                <span className="text-lg">✓</span>
                Все месяцы сбалансированы
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Статистика семьи</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Членов семьи</p>
            <p className="text-2xl font-bold">{familyMembers.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Статей расходов</p>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Средний остаток</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0,
              }).format(
                yearlyBudget.reduce((sum, m) => sum + m.balance, 0) / 12
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
