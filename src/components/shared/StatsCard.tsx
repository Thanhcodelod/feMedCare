"use client";
import { cn } from "@/utils/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "primary" | "success" | "warning" | "info" | "purple";
  className?: string;
}

const variantStyles = {
  default: { iconBg: "bg-muted", iconColor: "text-muted-foreground" },
  primary: { iconBg: "bg-primary/10", iconColor: "text-primary" },
  success: { iconBg: "bg-success-light", iconColor: "text-success" },
  warning: { iconBg: "bg-warning-light", iconColor: "text-warning" },
  info: { iconBg: "bg-info-light", iconColor: "text-info" },
  purple: { iconBg: "bg-purple-light", iconColor: "text-purple" },
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = "primary", className }: StatsCardProps) {
  const styles = variantStyles[variant];
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <div className={cn("card-elevated p-5 hover:shadow-md transition-shadow duration-200", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", styles.iconBg)}>
          <Icon className={cn("w-5 h-5", styles.iconColor)} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
          )}
          <span className={cn("text-xs font-semibold", isPositive ? "text-success" : "text-destructive")}>
            {isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
