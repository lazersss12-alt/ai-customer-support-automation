"use client";

import { FormEvent, KeyboardEvent, useState } from "react";

const MAX_LENGTH = 2000;

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = value.trim();
  const showEmptyError = touched && trimmed.length === 0;
  const showLengthError = trimmed.length > MAX_LENGTH;

  function submit() {
    setTouched(true);
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH || disabled) return;
    onSend(trimmed);
    setValue("");
    setTouched(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="chat-message" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-message"
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            aria-invalid={showEmptyError || showLengthError}
            aria-describedby={showEmptyError || showLengthError ? "chat-message-error" : undefined}
            className="max-h-32 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
          />
          {showEmptyError && (
            <p id="chat-message-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              Type a message before sending.
            </p>
          )}
          {!showEmptyError && showLengthError && (
            <p id="chat-message-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              Message is too long ({trimmed.length}/{MAX_LENGTH} characters).
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || trimmed.length === 0}
          aria-label="Send message"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14 0m0 0-6-6m6 6-6 6" />
          </svg>
        </button>
      </div>
    </form>
  );
}
