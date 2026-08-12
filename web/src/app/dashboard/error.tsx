"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-20 text-center dark:bg-black">
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        Couldn&apos;t load the dashboard
      </p>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {error.message || "Something went wrong talking to Supabase."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Try again
      </button>
    </div>
  );
}
