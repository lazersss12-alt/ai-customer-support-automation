import type { ConversationDetailDTO } from "@/lib/data/support";
import StatusBadge from "./StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ConversationDetail({ conversation }: { conversation: ConversationDetailDTO }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {conversation.customerName ?? "Anonymous"}
          </p>
          {conversation.customerEmail && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{conversation.customerEmail}</p>
          )}
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            Started {formatDate(conversation.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={conversation.status} />
          {typeof conversation.latestConfidence === "number" && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {Math.round(conversation.latestConfidence * 100)}% confidence
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {conversation.messages.map((message) => {
          const isCustomer = message.role === "customer";
          return (
            <div key={message.id} className={`flex w-full ${isCustomer ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] flex-col gap-1.5 ${isCustomer ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isCustomer
                      ? "rounded-br-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "rounded-bl-sm border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {message.content}
                </div>
                <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-zinc-400 dark:text-zinc-600">
                  <span>{formatDate(message.createdAt)}</span>
                  {!isCustomer && message.status && (
                    <>
                      <span aria-hidden>·</span>
                      <StatusBadge status={message.status} />
                    </>
                  )}
                  {!isCustomer && typeof message.confidence === "number" && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{Math.round(message.confidence * 100)}% confidence</span>
                    </>
                  )}
                </div>
                {!isCustomer && message.needsHuman && message.reason && (
                  <p className="max-w-sm rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Escalation reason: {message.reason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
