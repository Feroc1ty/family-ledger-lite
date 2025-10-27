import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, PieChart, Target } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Family Budget</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Умный сервис для планирования семейного бюджета
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Анализ расходов</h3>
            <p className="text-muted-foreground">
              Отслеживайте свои доходы и расходы в режиме реального времени
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <PieChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Планирование</h3>
            <p className="text-muted-foreground">
              Создавайте планы и достигайте финансовых целей семьи
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Накопления</h3>
            <p className="text-muted-foreground">
              Управляйте целями и контролируйте прогресс накоплений
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="text-lg px-12 py-6 h-auto"
            onClick={() => navigate("/login")}
          >
            Начать планировать бюджет
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Бесплатно для семей любого размера</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
