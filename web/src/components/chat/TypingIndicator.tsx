export default function TypingIndicator() {
  return (
    <div className="flex w-full justify-start" role="status" aria-label="Assistant is typing">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-600"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
