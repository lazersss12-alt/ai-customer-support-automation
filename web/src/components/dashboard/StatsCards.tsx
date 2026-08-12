import type { ConversationStats } from "@/lib/data/support";

const CARDS: { key: keyof ConversationStats; label: string; accent: string }[] = [
  { key: "total", label: "Total conversations", accent: "text-zinc-900 dark:text-zinc-50" },
  { key: "resolved", label: "Resolved", accent: "text-emerald-600 dark:text-emerald-400" },
  { key: "needsHuman", label: "Needs human", accent: "text-amber-600 dark:text-amber-400" },
  { key: "unknown", label: "Unknown", accent: "text-sky-600 dark:text-sky-400" },
];

export default function StatsCards({ stats }: { stats: ConversationStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
          <p className={`mt-1.5 text-2xl font-semibold tabular-nums sm:text-3xl ${card.accent}`}>
            {stats[card.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
