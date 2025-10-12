import { useState } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCurrency } from "@/utils/budgetCalculations";
import { toast } from "sonner";

const Family = () => {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useBudgetData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    monthlyIncome: "",
  });

  const totalIncome = familyMembers.reduce((sum, member) => sum + member.monthlyIncome, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.monthlyIncome) {
      toast.error("Заполните все поля");
      return;
    }

    if (editingId) {
      updateFamilyMember(editingId, {
        name: formData.name,
        monthlyIncome: Number(formData.monthlyIncome),
      });
      toast.success("Член семьи обновлён");
    } else {
      addFamilyMember({
        name: formData.name,
        monthlyIncome: Number(formData.monthlyIncome),
      });
      toast.success("Член семьи добавлен");
    }

    setFormData({ name: "", monthlyIncome: "" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      monthlyIncome: member.monthlyIncome.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteFamilyMember(id);
    toast.success("Член семьи удалён");
  };

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Семья</h2>
          <p className="text-muted-foreground">
            Управление членами семьи и их доходами
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData({ name: "", monthlyIncome: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Редактировать" : "Добавить"} члена семьи
                </DialogTitle>
                <DialogDescription>
                  Введите имя и ежемесячный доход
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Например, Иван"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Ежемесячный доход (₽)</Label>
                  <Input
                    id="income"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyIncome: e.target.value })
                    }
                    placeholder="50000"
                  />
                </div>
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
          <CardTitle>Члены семьи</CardTitle>
        </CardHeader>
        <CardContent>
          {familyMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет членов семьи</p>
              <p className="text-sm mt-1">Добавьте первого члена семьи</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead className="text-right">Доход (₽/мес)</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(member.monthlyIncome)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Общий доход:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(totalIncome)}
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

export default Family;
