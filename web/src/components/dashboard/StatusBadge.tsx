import type { ConversationStatus } from "@/lib/constants";

const LABELS: Record<ConversationStatus, string> = {
  open: "Open",
  resolved: "Resolved",
  needs_human: "Needs human",
  unknown: "Unknown",
};

const STYLES: Record<ConversationStatus, string> = {
  open: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  needs_human: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  unknown: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
};

export default function StatusBadge({ status }: { status: ConversationStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
