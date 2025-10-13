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
  "Подарки",
  "Прочее",
];

const MONTHS = Array.from({ length: 12 }, (_, i) => getMonthName(i));

const DAYS_OF_WEEK = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

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
    dayOfWeek: "Понедельник",
  });

  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "Все">("Все");
  const [filterType, setFilterType] = useState<ExpenseType | "all">("all");
  const [sortField, setSortField] = useState<"category" | "type" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  const totalYearly = expenses
    .filter((e) => e.type === "yearly")
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredAndSortedExpenses = expenses
    .filter((expense) => {
      if (filterCategory !== "Все" && expense.category !== filterCategory) {
        return false;
      }
      if (filterType !== "all" && expense.type !== filterType) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const multiplier = sortDirection === "asc" ? 1 : -1;
      
      if (sortField === "category") {
        return a.category.localeCompare(b.category) * multiplier;
      } else if (sortField === "type") {
        return a.type.localeCompare(b.type) * multiplier;
      }
      
      return 0;
    });

  const handleSort = (field: "category" | "type") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
      ...(formData.type !== "monthly" && formData.type !== "daily" && formData.type !== "weekly" && { dueMonth: formData.dueMonth }),
      ...(formData.type === "weekly" && { dayOfWeek: formData.dayOfWeek }),
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
      dayOfWeek: "Понедельник",
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
      dayOfWeek: expense.dayOfWeek || "Понедельник",
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

  const getCategoryBorderColor = (category: ExpenseCategory) => {
    const colors: Record<string, string> = {
      "Еда": "border-l-4 border-blue-500 hover:border-blue-600 dark:border-blue-400 dark:hover:border-blue-300",
      "Авто": "border-l-4 border-purple-500 hover:border-purple-600 dark:border-purple-400 dark:hover:border-purple-300",
      "Коммунальные": "border-l-4 border-green-500 hover:border-green-600 dark:border-green-400 dark:hover:border-green-300",
      "Развлечения": "border-l-4 border-pink-500 hover:border-pink-600 dark:border-pink-400 dark:hover:border-pink-300",
      "Подарки": "border-l-4 border-orange-500 hover:border-orange-600 dark:border-orange-400 dark:hover:border-orange-300",
      "Прочее": "border-l-4 border-gray-400 hover:border-gray-500 dark:border-gray-500 dark:hover:border-gray-400",
    };
    return colors[category] || colors["Прочее"];
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
                  dayOfWeek: "Понедельник",
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
                {formData.type === "weekly" && (
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">День недели</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dayOfWeek: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.type !== "monthly" && formData.type !== "daily" && formData.type !== "weekly" && (
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
          <div className="flex flex-col gap-4">
            <CardTitle>Все расходы</CardTitle>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="filterCategory" className="text-sm mb-2 block">
                  Фильтр по категории
                </Label>
                <Select
                  value={filterCategory}
                  onValueChange={(value) => setFilterCategory(value as ExpenseCategory | "Все")}
                >
                  <SelectTrigger id="filterCategory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Все">Все категории</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="filterType" className="text-sm mb-2 block">
                  Фильтр по типу
                </Label>
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value as ExpenseType | "all")}
                >
                  <SelectTrigger id="filterType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {expenses.length === 0 
                  ? "Нет расходов" 
                  : "Нет расходов, соответствующих фильтрам"}
              </p>
              <p className="text-sm mt-1">
                {expenses.length === 0 
                  ? "Добавьте первый расход" 
                  : "Попробуйте изменить фильтры"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex gap-4 text-sm">
                <button
                  onClick={() => handleSort("category")}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Сортировка по категории
                  {sortField === "category" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleSort("type")}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Сортировка по типу
                  {sortField === "type" && (
                    <span className="text-xs">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {filteredAndSortedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`rounded-lg border bg-card hover:shadow-sm transition-all duration-200 p-3 ${getCategoryBorderColor(expense.category)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-0.5 truncate">
                          {expense.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Категория:</span>
                            {expense.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Тип:</span>
                            {getTypeLabel(expense.type)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Ежемесячные расходы:</span>
                  <span className="text-2xl font-bold text-destructive">
                    {formatCurrency(totalMonthly)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Ежегодные расходы:</span>
                  <span className="text-2xl font-bold text-warning">
                    {formatCurrency(totalYearly)}
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
