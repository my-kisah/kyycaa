import { Eye, FileText, MessageCircle, Users } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";

const iconMap = {
  activities: FileText,
  comments: MessageCircle,
  users: Users,
  views: Eye,
};

export function StatsGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: number;
    tone?: "activities" | "comments" | "users" | "views";
    helper: string;
  }>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = iconMap[item.tone ?? "activities"];
        return (
          <div
            key={item.label}
            className="rounded-[30px] border border-white/60 bg-white/72 p-6 shadow-[0_22px_48px_rgba(206,140,170,0.12)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-rose-700/80">{item.label}</p>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-5 text-4xl font-semibold text-rose-950">
              {formatCompactNumber(item.value)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-rose-500">
              {item.helper}
            </p>
          </div>
        );
      })}
    </div>
  );
}
