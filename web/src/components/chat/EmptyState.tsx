const EXAMPLE_PROMPTS = [
  "How long does shipping take?",
  "What is your return policy?",
  "Does this product have a warranty?",
];

export default function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h8M8 14h5M21 12a9 9 0 1 1-4.06-7.52L21 3l-1.02 4.06A8.96 8.96 0 0 1 21 12Z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Hi, I&apos;m the Northlane Goods support assistant
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        Ask me about shipping, orders, returns, refunds, or warranty. I&apos;ll answer from our
        knowledge base, or connect you with a person if I can&apos;t help.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
