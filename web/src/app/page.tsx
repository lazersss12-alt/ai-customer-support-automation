import ChatWindow from "@/components/chat/ChatWindow";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(24,24,27,0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.06),transparent)]"
      />

      <header className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            N
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Northlane Goods
          </span>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Demo
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-balance text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
            Customer support
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Portfolio demo — answers come from a fixed demo knowledge base for a fictional
            company, not a real support team.
          </p>
        </div>

        <ChatWindow />
      </main>

      <footer className="mx-auto w-full max-w-3xl px-4 pb-8 text-center text-xs text-zinc-400 sm:px-6 dark:text-zinc-600">
        Powered by an n8n + AI automation pipeline.
      </footer>
    </div>
  );
}
