export const CONVERSATION_STATUSES = ["open", "resolved", "needs_human", "unknown"] as const;

export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

// Statuses an AI message (and therefore a conversation, once answered) can settle into.
// "open" only applies to a conversation that hasn't received an AI response yet.
export const MESSAGE_STATUSES = ["resolved", "needs_human", "unknown"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const KNOWLEDGE_BASE_CATEGORIES = [
  "company_info",
  "shipping",
  "order_processing",
  "returns",
  "refunds",
  "warranty",
  "product_info",
  "contact_support",
] as const;

export type KnowledgeBaseCategory = (typeof KNOWLEDGE_BASE_CATEGORIES)[number];
