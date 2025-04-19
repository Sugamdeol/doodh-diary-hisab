
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const StatsCard = ({ title, value, icon, trend, className }: StatsCardProps) => {
  return (
    <div className={cn("card-milk-stats", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-milk-500">{icon}</div>}
      </div>
      <div className="font-bold text-2xl">{value}</div>
      {trend && (
        <div className="text-xs flex items-center">
          <span
            className={cn(
              "mr-1",
              trend.value > 0 ? "text-green-500" : trend.value < 0 ? "text-red-500" : "text-gray-500"
            )}
          >
            {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
