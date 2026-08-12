import type { ChatMessage } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  resolved: "Resolved",
  needs_human: "Escalated",
  unknown: "Uncertain",
};

const STATUS_STYLE: Record<string, string> = {
  resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  needs_human: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  unknown: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.role === "customer";

  return (
    <div
      className={`flex w-full ${isCustomer ? "justify-end" : "justify-start"}`}
      role="group"
      aria-label={isCustomer ? "Your message" : "Assistant message"}
    >
      <div className={`flex max-w-[85%] flex-col gap-1 sm:max-w-[75%] ${isCustomer ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isCustomer
              ? "rounded-br-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : message.failed
                ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                : "rounded-bl-sm border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          } ${message.pending ? "opacity-70" : ""}`}
        >
          {message.content}
        </div>

        {!isCustomer && message.status && !message.pending && !message.failed && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[message.status]}`}
          >
            {STATUS_LABEL[message.status]}
            {typeof message.confidence === "number" && (
              <span className="ml-1 font-normal opacity-75">
                · {Math.round(message.confidence * 100)}% confidence
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
