import Link from "next/link";
import type { ConversationDTO } from "@/lib/data/support";
import StatusBadge from "./StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const HEADERS = ["Customer", "Latest message", "Status", "Confidence", "Created at"];

export default function ConversationsTable({ conversations }: { conversations: ConversationDTO[] }) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No conversations found</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          No conversations match the current filter, or none have come in yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
            {conversations.map((conversation) => (
              <tr key={conversation.id} className="align-top hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  <Link href={`/dashboard/${conversation.id}`} className="hover:underline">
                    {conversation.customerName ?? "Anonymous"}
                  </Link>
                  {conversation.customerEmail && (
                    <p className="mt-0.5 text-xs font-normal text-zinc-500 dark:text-zinc-500">
                      {conversation.customerEmail}
                    </p>
                  )}
                </td>
                <td className="max-w-[320px] px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  <span className="line-clamp-2">{conversation.latestMessage ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={conversation.status} />
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {typeof conversation.latestConfidence === "number"
                    ? `${Math.round(conversation.latestConfidence * 100)}%`
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-500">
                  {formatDate(conversation.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
