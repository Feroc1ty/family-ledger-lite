import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/budgetCalculations";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  title: string;
  amount: number;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

const BalanceCard = ({ title, amount, description, variant = "default" }: BalanceCardProps) => {
  const variantStyles = {
    default: "border-border",
    success: "border-success bg-success/5",
    warning: "border-warning bg-warning/5",
    destructive: "border-destructive bg-destructive/5",
  };

  const textStyles = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card className={cn("animate-fade-in", variantStyles[variant])}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold mb-1", textStyles[variant])}>
          {formatCurrency(amount)}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
