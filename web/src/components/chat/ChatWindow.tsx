"use client";

import { useRef, useState } from "react";
import type { ChatMessage, SupportResponse } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";
import EscalationBanner from "./EscalationBanner";
import ChatInput from "./ChatInput";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL;
  const hasEscalation = messages.some((m) => m.role === "ai" && m.needsHuman);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function sendMessage(text: string) {
    setErrorMessage(null);

    const customerMessage: ChatMessage = { id: newId(), role: "customer", content: text };
    const pendingId = newId();
    setMessages((prev) => [...prev, customerMessage, { id: pendingId, role: "ai", content: "", pending: true }]);
    scrollToBottom();

    if (!webhookUrl) {
      setMessages((prev) => prev.filter((m) => m.id !== pendingId));
      setErrorMessage("This demo isn't configured yet (missing NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL).");
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationIdRef.current,
          message: text,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as SupportResponse;
      conversationIdRef.current = data.conversation_id;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                id: pendingId,
                role: "ai",
                content: data.answer,
                status: data.status,
                confidence: data.confidence,
                needsHuman: data.needs_human,
                reason: data.reason,
              }
            : m
        )
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== pendingId));
      setErrorMessage("Something went wrong reaching support. Please try sending your message again.");
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950">
      <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <EmptyState onPick={sendMessage} />
        ) : (
          <>
            {hasEscalation && <EscalationBanner />}
            {messages.map((message) =>
              message.pending ? <TypingIndicator key={message.id} /> : <MessageBubble key={message.id} message={message} />
            )}
          </>
        )}
      </div>

      {errorMessage && (
        <div role="alert" className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 sm:mx-6">
          {errorMessage}
        </div>
      )}

      <ChatInput onSend={sendMessage} disabled={isSending} />
    </div>
  );
}
