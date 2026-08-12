import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversationDetail } from "@/lib/data/support";
import ConversationDetail from "@/components/dashboard/ConversationDetail";

export const metadata = {
  title: "Conversation — Customer Support",
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getConversationDetail(id);

  if (!conversation) {
    notFound();
  }

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
          Back to dashboard
        </Link>

        <ConversationDetail conversation={conversation} />
      </div>
    </div>
  );
}
