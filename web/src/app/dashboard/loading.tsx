export default function DashboardLoading() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>

        <div className="mt-8 h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800 sm:mt-10" />
      </div>
    </div>
  );
}
