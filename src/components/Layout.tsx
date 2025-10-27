import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, Users, Receipt, CalendarDays, Calendar, PiggyBank, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { exportData } from "@/utils/dataExport";
import { useToast } from "@/hooks/use-toast";

const Layout = () => {
  const location = useLocation();
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportData();
      toast({
        title: "Данные экспортированы",
        description: "Файл с вашими данными успешно сохранен",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Главная", icon: Home },
    { path: "/family", label: "Семья", icon: Users },
    { path: "/expenses", label: "Расходы", icon: Receipt },
    { path: "/expense-calendar", label: "Календарь", icon: CalendarDays },
    { path: "/planning", label: "Планирование", icon: Calendar },
    { path: "/savings", label: "Накопления", icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Family Budget</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="hidden md:flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Экспорт данных
              </Button>
              <nav className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
