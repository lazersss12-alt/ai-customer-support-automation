import { getConversationStats, getRecentConversations } from "@/lib/data/support";
import { CONVERSATION_STATUSES, type ConversationStatus } from "@/lib/constants";
import StatsCards from "@/components/dashboard/StatsCards";
import FiltersBar from "@/components/dashboard/FiltersBar";
import ConversationsTable from "@/components/dashboard/ConversationsTable";

export const metadata = {
  title: "Dashboard — Customer Support",
};

function parseStatus(value: string | string[] | undefined): ConversationStatus | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return (CONVERSATION_STATUSES as readonly string[]).includes(v ?? "") ? (v as ConversationStatus) : undefined;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);

  const [stats, conversations] = await Promise.all([
    getConversationStats(),
    getRecentConversations({ status }),
  ]);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
              N
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Northlane Goods — internal
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Support dashboard
          </h1>
        </header>

        <StatsCards stats={stats} />

        <section className="mt-8 sm:mt-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Recent conversations
              {conversations.length > 0 && (
                <span className="ml-1.5 font-normal text-zinc-400 dark:text-zinc-500">
                  ({conversations.length})
                </span>
              )}
            </h2>
            <FiltersBar />
          </div>
          <ConversationsTable conversations={conversations} />
        </section>
      </div>
    </div>
  );
}
