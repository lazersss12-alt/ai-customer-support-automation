import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CONVERSATION_STATUSES, type ConversationStatus, type MessageStatus } from "@/lib/constants";

// Data Access Layer: the only module (besides supabase-admin) allowed to
// touch the conversations/messages/escalations tables. Returns plain DTOs so
// nothing Supabase-shaped leaks into components.

export type ConversationDTO = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: ConversationStatus;
  latestConfidence: number | null;
  latestMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageDTO = {
  id: string;
  role: "customer" | "ai";
  content: string;
  status: MessageStatus | null;
  confidence: number | null;
  needsHuman: boolean;
  reason: string | null;
  createdAt: string;
};

export type ConversationDetailDTO = ConversationDTO & {
  messages: MessageDTO[];
};

export type ConversationStats = {
  total: number;
  resolved: number;
  needsHuman: number;
  unknown: number;
};

export type ConversationFilters = {
  status?: ConversationStatus;
};

const RECENT_LIMIT = 100;

type RawConversationRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  latest_confidence: number | null;
  created_at: string;
  updated_at: string;
};

function isConversationStatus(value: string): value is ConversationStatus {
  return (CONVERSATION_STATUSES as readonly string[]).includes(value);
}

function toConversationDTO(row: RawConversationRow, latestMessage: string | null): ConversationDTO {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    status: isConversationStatus(row.status) ? row.status : "open",
    latestConfidence: row.latest_confidence,
    latestMessage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getConversationStats(): Promise<ConversationStats> {
  const [total, resolved, needsHuman, unknown] = await Promise.all([
    supabaseAdmin.from("conversations").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("conversations").select("id", { count: "exact", head: true }).eq("status", "resolved"),
    supabaseAdmin.from("conversations").select("id", { count: "exact", head: true }).eq("status", "needs_human"),
    supabaseAdmin.from("conversations").select("id", { count: "exact", head: true }).eq("status", "unknown"),
  ]);

  for (const result of [total, resolved, needsHuman, unknown]) {
    if (result.error) {
      throw new Error(`Failed to load conversation stats: ${result.error.message}`);
    }
  }

  return {
    total: total.count ?? 0,
    resolved: resolved.count ?? 0,
    needsHuman: needsHuman.count ?? 0,
    unknown: unknown.count ?? 0,
  };
}

export async function getRecentConversations(filters: ConversationFilters = {}): Promise<ConversationDTO[]> {
  let query = supabaseAdmin
    .from("conversations")
    .select("id, customer_name, customer_email, status, latest_confidence, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(RECENT_LIMIT);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data: conversations, error } = await query;

  if (error) {
    throw new Error(`Failed to load conversations: ${error.message}`);
  }

  const rows = conversations as RawConversationRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });

  if (messagesError) {
    throw new Error(`Failed to load latest messages: ${messagesError.message}`);
  }

  const latestByConversation = new Map<string, string>();
  for (const message of messages as { conversation_id: string; content: string; created_at: string }[]) {
    if (!latestByConversation.has(message.conversation_id)) {
      latestByConversation.set(message.conversation_id, message.content);
    }
  }

  return rows.map((row) => toConversationDTO(row, latestByConversation.get(row.id) ?? null));
}

export async function getConversationDetail(id: string): Promise<ConversationDetailDTO | null> {
  const { data: conversation, error } = await supabaseAdmin
    .from("conversations")
    .select("id, customer_name, customer_email, status, latest_confidence, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load conversation: ${error.message}`);
  }
  if (!conversation) return null;

  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("id, role, content, status, confidence, needs_human, reason, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(`Failed to load messages: ${messagesError.message}`);
  }

  type RawMessageRow = {
    id: string;
    role: "customer" | "ai";
    content: string;
    status: string | null;
    confidence: number | null;
    needs_human: boolean;
    reason: string | null;
    created_at: string;
  };

  const messageDTOs: MessageDTO[] = (messages as RawMessageRow[]).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    status: row.status as MessageStatus | null,
    confidence: row.confidence,
    needsHuman: row.needs_human,
    reason: row.reason,
    createdAt: row.created_at,
  }));

  const latestMessage = messageDTOs.length > 0 ? messageDTOs[messageDTOs.length - 1].content : null;

  return {
    ...toConversationDTO(conversation as RawConversationRow, latestMessage),
    messages: messageDTOs,
  };
}
