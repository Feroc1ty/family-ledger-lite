import { useState, useMemo } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { formatCurrency, calculateMonthlyExpenses, calculateMonthlySavingsGoals, calculatePlannedExpenses } from "@/utils/budgetCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SavingsGoal } from "@/types/budget";

const Savings = () => {
  const { savingsGoals, expenses, familyMembers, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useBudgetData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    monthlySaving: "",
    targetDate: "",
    currentAmount: "0",
  });

  const totalMonthlyIncome = useMemo(() => {
    return familyMembers.reduce((sum, member) => sum + member.monthlyIncome, 0);
  }, [familyMembers]);

  const totalMonthlyExpenses = useMemo(() => {
    return calculateMonthlyExpenses(expenses);
  }, [expenses]);

  const totalPlannedExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return calculatePlannedExpenses(expenses, currentMonth);
  }, [expenses]);

  const totalMonthlySavingsGoals = useMemo(() => {
    return calculateMonthlySavingsGoals(savingsGoals);
  }, [savingsGoals]);

  const remainingBalance = totalMonthlyIncome - totalMonthlyExpenses - totalPlannedExpenses - totalMonthlySavingsGoals;

  const enrichedGoals = useMemo(() => {
    return savingsGoals.map((goal) => {
      let calculatedMonthlySaving = goal.monthlySaving || 0;
      let monthsToTarget = 0;
      let progressPercent = 0;
      let projectedTotal = 0;

      if (goal.targetAmount) {
        const remaining = goal.targetAmount - goal.currentAmount;
        progressPercent = (goal.currentAmount / goal.targetAmount) * 100;

        if (goal.targetDate) {
          monthsToTarget = Math.ceil(
            (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44)
          );
          if (monthsToTarget > 0) {
            calculatedMonthlySaving = remaining / monthsToTarget;
            projectedTotal = goal.currentAmount + (calculatedMonthlySaving * monthsToTarget);
          }
        } else if (goal.monthlySaving) {
          monthsToTarget = Math.ceil(remaining / goal.monthlySaving);
        }
      }

      return {
        ...goal,
        calculatedMonthlySaving,
        monthsToTarget,
        progressPercent,
        projectedTotal,
      };
    });
  }, [savingsGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Введите название цели");
      return;
    }

    if (!formData.targetAmount && !formData.monthlySaving) {
      toast.error("Укажите целевую сумму или ежемесячное откладывание");
      return;
    }

    const goalData: Omit<SavingsGoal, "id"> = {
      title: formData.title.trim(),
      targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
      monthlySaving: formData.monthlySaving ? parseFloat(formData.monthlySaving) : undefined,
      targetDate: formData.targetDate || undefined,
      currentAmount: parseFloat(formData.currentAmount) || 0,
    };

    if (editingId) {
      updateSavingsGoal(editingId, goalData);
      toast.success("Цель обновлена");
      setEditingId(null);
    } else {
      addSavingsGoal(goalData);
      toast.success("Цель добавлена");
    }

    resetForm();
  };

  const handleEdit = (goal: SavingsGoal) => {
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount?.toString() || "",
      monthlySaving: goal.monthlySaving?.toString() || "",
      targetDate: goal.targetDate || "",
      currentAmount: goal.currentAmount.toString(),
    });
    setEditingId(goal.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    deleteSavingsGoal(id);
    toast.success("Цель удалена");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      targetAmount: "",
      monthlySaving: "",
      targetDate: "",
      currentAmount: "0",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Накопления</h2>
        <p className="text-muted-foreground">
          Установите цели и планируйте накопления
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Откладываем на цели
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalMonthlySavingsGoals)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Обязательные расходы
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalMonthlyExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Отложенные расходы
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalPlannedExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Остаток
                </p>
                <p className={`text-2xl font-bold ${remainingBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Добавить цель
        </Button>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Редактировать цель" : "Новая цель накопления"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название цели *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Отпуск, Новый телефон"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Целевая сумма</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="100000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlySaving">Откладывать ежемесячно</Label>
                  <Input
                    id="monthlySaving"
                    type="number"
                    step="0.01"
                    value={formData.monthlySaving}
                    onChange={(e) => setFormData({ ...formData, monthlySaving: e.target.value })}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Дата достижения цели</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Уже накоплено</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Сохранить" : "Добавить"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Цели накоплений</CardTitle>
        </CardHeader>
        <CardContent>
          {enrichedGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет целей для накоплений</p>
              <p className="text-sm mt-1">
                Добавьте цель, чтобы начать планировать накопления
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Цель</TableHead>
                    <TableHead className="text-right">Целевая сумма</TableHead>
                    <TableHead className="text-right">Накоплено</TableHead>
                    <TableHead className="text-right">Прогресс</TableHead>
                    <TableHead className="text-right">Откладывать ежемесячно</TableHead>
                    <TableHead className="text-right">Осталось месяцев</TableHead>
                    <TableHead className="text-right">Целевая дата</TableHead>
                    <TableHead className="text-right">Будет накоплено</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.title}</TableCell>
                      <TableCell className="text-right">
                        {goal.targetAmount ? formatCurrency(goal.targetAmount) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(goal.currentAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {goal.targetAmount ? `${Math.round(goal.progressPercent)}%` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(goal.calculatedMonthlySaving)}
                      </TableCell>
                      <TableCell className="text-right">
                        {goal.monthsToTarget > 0 ? goal.monthsToTarget : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {goal.targetDate
                          ? new Date(goal.targetDate).toLocaleDateString("ru-RU")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {goal.projectedTotal > 0 ? formatCurrency(goal.projectedTotal) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(goal)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
