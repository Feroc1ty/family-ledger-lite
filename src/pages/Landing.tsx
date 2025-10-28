import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, PieChart, Target, Users, Calendar, Download, Shield } from "lucide-react";
import { useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add JSON-LD structured data for SEO
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Family Budget - Планирование семейного и личного бюджета",
      "description": "Бесплатный онлайн-сервис для планирования семейного бюджета и личных финансов. Управляйте доходами и расходами, контролируйте накопления, планируйте бюджет на месяц.",
      "applicationCategory": "FinanceApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "RUB"
      }
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Планирование семейного бюджета и личных финансов
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
            Научитесь правильно планировать семейный бюджет на месяц, управлять доходами и расходами. 
            Бесплатный онлайн-сервис для личного финансового планирования и управления семейным бюджетом
          </p>
        </header>

        {/* Main Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Как грамотно планировать семейный бюджет
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <article className="text-center p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Планирование доходов и расходов</h3>
              <p className="text-muted-foreground">
                Отслеживайте все доходы семейного бюджета и планируйте личные расходы в режиме реального времени. 
                Контролируйте каждую категорию расходов и управляйте семейным бюджетом эффективно
              </p>
            </article>

            <article className="text-center p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <PieChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Планирование семейного бюджета на месяц</h3>
              <p className="text-muted-foreground">
                Создавайте месячные планы бюджета семьи, устанавливайте лимиты расходов по категориям. 
                Правила планирования помогут достигать финансовых целей
              </p>
            </article>

            <article className="text-center p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Финансовое планирование и накопления</h3>
              <p className="text-muted-foreground">
                Личное финансовое планирование и контроль семейного бюджета. Управляйте целями накоплений, 
                отслеживайте прогресс и достигайте финансовых целей семьи
              </p>
            </article>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Как научиться планировать семейный бюджет
          </h2>
          <div className="space-y-6">
            <article className="flex gap-4 p-6 rounded-lg bg-card border">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Учет всех доходов семейного бюджета</h3>
                <p className="text-muted-foreground">
                  Зарегистрируйте все источники дохода: зарплаты, подработки, пассивный доход. 
                  Планирование доходов семейного бюджета начинается с полной картины поступлений
                </p>
              </div>
            </article>

            <article className="flex gap-4 p-6 rounded-lg bg-card border">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Планирование личных расходов по категориям</h3>
                <p className="text-muted-foreground">
                  Разделите расходы на категории: продукты, транспорт, коммунальные услуги, развлечения. 
                  Так вы поймете, как правильно планировать семейный бюджет и оптимизировать траты
                </p>
              </div>
            </article>

            <article className="flex gap-4 p-6 rounded-lg bg-card border">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Анализ и корректировка бюджета семьи</h3>
                <p className="text-muted-foreground">
                  Регулярно проверяйте планирование расходов семьи, анализируйте отклонения от плана. 
                  Корректируйте бюджет для достижения финансовых целей
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* For Whom Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Для кого подходит наш сервис планирования
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <article className="p-6 rounded-lg bg-card border">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Для семей любого размера</h3>
              <p className="text-muted-foreground">
                Планирование семейного бюджета для семей от 2 до 10+ человек. Управляйте общими расходами, 
                распределяйте обязанности, контролируйте семейный бюджет вместе
              </p>
            </article>

            <article className="p-6 rounded-lg bg-card border">
              <Target className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Для личного финансового планирования</h3>
              <p className="text-muted-foreground">
                Планирование личных доходов и расходов для одного человека. Контролируйте личные финансы, 
                ведите личный семейный бюджет, достигайте персональных финансовых целей
              </p>
            </article>
          </div>
        </section>

        {/* Additional Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Дополнительные возможности
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <article className="text-center p-6 rounded-lg bg-card border">
              <Calendar className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Календарь расходов</h3>
              <p className="text-muted-foreground text-sm">
                Визуализируйте планирование расходов в календаре, отслеживайте траты по дням
              </p>
            </article>

            <article className="text-center p-6 rounded-lg bg-card border">
              <Download className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Экспорт данных</h3>
              <p className="text-muted-foreground text-sm">
                Выгружайте отчеты по планированию семейного бюджета в удобных форматах
              </p>
            </article>

            <article className="text-center p-6 rounded-lg bg-card border">
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Безопасность данных</h3>
              <p className="text-muted-foreground text-sm">
                Ваши финансовые данные надежно защищены и доступны только вам
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">
            Начните планирование личного и семейного бюджета прямо сейчас
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые научились правильно планировать семейный бюджет 
            и эффективно управлять личными финансами
          </p>
          <Button 
            size="lg" 
            className="text-lg px-12 py-6 h-auto"
            onClick={() => navigate("/login")}
          >
            Начать планировать бюджет бесплатно
          </Button>
        </section>

        {/* Footer Info */}
        <footer className="text-center text-sm text-muted-foreground space-y-2">
          <p>Бесплатный сервис для планирования семейного бюджета и личных финансов</p>
          <p>Подходит для семей любого размера и индивидуального использования</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
