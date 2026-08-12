"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CONVERSATION_STATUSES, type ConversationStatus } from "@/lib/constants";

const STATUS_OPTIONS: { value: ConversationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...CONVERSATION_STATUSES.filter((s) => s !== "open").map((status) => ({
    value: status,
    label:
      status === "needs_human"
        ? "Needs human"
        : status[0].toUpperCase() + status.slice(1),
  })),
];

export default function FiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStatus = searchParams.get("status") ?? "all";

  function updateStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div
      role="group"
      aria-label="Filter conversations by status"
      className="inline-flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950"
    >
      {STATUS_OPTIONS.map((option) => {
        const isActive = activeStatus === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => updateStatus(option.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
