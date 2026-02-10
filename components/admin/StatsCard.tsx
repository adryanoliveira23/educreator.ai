import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-md transition hover:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="rounded-lg bg-gray-800 p-2 text-blue-500">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {trendUp ? (
              <ArrowUp size={12} className="text-green-500" />
            ) : (
              <ArrowDown size={12} className="text-red-500" />
            )}
            <span className={trendUp ? "text-green-500" : "text-red-500"}>
              {trend}
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
