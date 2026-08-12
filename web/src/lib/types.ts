import type { MessageStatus } from "./constants";

// Shape returned by the n8n webhook for a resolved AI turn.
export type SupportResponse = {
  conversation_id: string;
  answer: string;
  status: MessageStatus;
  confidence: number;
  needs_human: boolean;
  reason: string | null;
};

export type ChatRole = "customer" | "ai";

// UI-side representation of a single chat bubble, including transient
// states (sending/error) that never get persisted to Supabase.
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  status?: MessageStatus;
  confidence?: number;
  needsHuman?: boolean;
  reason?: string | null;
  pending?: boolean;
  failed?: boolean;
};
