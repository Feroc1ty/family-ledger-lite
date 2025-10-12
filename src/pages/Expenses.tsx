import { useState } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, getMonthName } from "@/utils/budgetCalculations";
import { ExpenseType, ExpenseCategory } from "@/types/budget";
import { toast } from "sonner";

const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: "daily", label: "Ежедневный" },
  { value: "weekly", label: "Еженедельный" },
  { value: "monthly", label: "Ежемесячный" },
  { value: "quarterly", label: "Раз в 3 месяца" },
  { value: "yearly", label: "Раз в год" },
  { value: "custom", label: "Пользовательский" },
];

const CATEGORIES: ExpenseCategory[] = [
  "Еда",
  "Авто",
  "Коммунальные",
  "Развлечения",
  "Прочее",
];

const MONTHS = Array.from({ length: 12 }, (_, i) => getMonthName(i));

const Expenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useBudgetData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Прочее" as ExpenseCategory,
    type: "monthly" as ExpenseType,
    dueMonth: getMonthName(new Date().getMonth()),
    startMonth: getMonthName(new Date().getMonth()),
  });

  const totalMonthly = expenses
    .filter((e) => e.type === "monthly" || e.type === "daily" || e.type === "weekly")
    .reduce((sum, e) => {
      if (e.type === "daily") {
        return sum + (e.amount * 30.44);
      } else if (e.type === "weekly") {
        return sum + (e.amount * 4.33);
      }
      return sum + e.amount;
    }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.amount) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const expenseData = {
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category,
      type: formData.type,
      startMonth: formData.startMonth,
      ...(formData.type !== "monthly" && { dueMonth: formData.dueMonth }),
    };

    if (editingId) {
      updateExpense(editingId, expenseData);
      toast.success("Расход обновлён");
    } else {
      addExpense(expenseData);
      toast.success("Расход добавлен");
    }

    setFormData({
      title: "",
      amount: "",
      category: "Прочее",
      type: "monthly",
      dueMonth: getMonthName(new Date().getMonth()),
      startMonth: getMonthName(new Date().getMonth()),
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      type: expense.type,
      dueMonth: expense.dueMonth || getMonthName(new Date().getMonth()),
      startMonth: expense.startMonth,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    toast.success("Расход удалён");
  };

  const getTypeLabel = (type: ExpenseType) => {
    return EXPENSE_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Расходы</h2>
          <p className="text-muted-foreground">
            Управление всеми видами расходов
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  amount: "",
                  category: "Прочее",
                  type: "monthly",
                  dueMonth: getMonthName(new Date().getMonth()),
                  startMonth: getMonthName(new Date().getMonth()),
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Редактировать" : "Добавить"} расход
                </DialogTitle>
                <DialogDescription>
                  Заполните информацию о расходе
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Например, Интернет"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма (₽)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: ExpenseCategory) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Тип</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ExpenseType) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.type !== "monthly" && (
                  <div className="space-y-2">
                    <Label htmlFor="dueMonth">Месяц платежа</Label>
                    <Select
                      value={formData.dueMonth}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dueMonth: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingId ? "Сохранить" : "Добавить"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все расходы</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет расходов</p>
              <p className="text-sm mt-1">Добавьте первый расход</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.title}
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{getTypeLabel(expense.type)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
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
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Ежемесячные расходы:</span>
                  <span className="text-2xl font-bold text-destructive">
                    {formatCurrency(totalMonthly)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
