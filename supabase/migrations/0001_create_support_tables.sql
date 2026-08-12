-- Portfolio Project #2: AI Customer Support Automation
-- Schema for a fictional e-commerce company's support chat.
-- Isolated from Project #1 (AI Lead Qualification) — does not touch the
-- `leads` table or any Project #1 object.

-- ---------------------------------------------------------------------------
-- conversations: one row per chat session between a customer and the AI.
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  customer_name text,
  customer_email text,
  channel text not null default 'web_chat',

  -- Mirrors the status of the most recent AI message, kept denormalized here
  -- so the dashboard can list/filter conversations without joining messages.
  status text not null default 'open'
    check (status in ('open', 'resolved', 'needs_human', 'unknown')),
  latest_confidence numeric check (latest_confidence between 0 and 1)
);

create index if not exists conversations_created_at_idx on public.conversations (created_at desc);
create index if not exists conversations_status_idx on public.conversations (status);

alter table public.conversations enable row level security;
-- No public policies on purpose — this table is only ever touched server-side
-- (n8n workflow, and the dashboard's server-side data layer via the
-- service_role key), same pattern as Project 1's `leads` table.

-- ---------------------------------------------------------------------------
-- messages: every customer and AI message in a conversation.
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  created_at timestamptz not null default now(),

  role text not null check (role in ('customer', 'ai')),
  content text not null,

  -- Only populated on AI messages — the structured decision returned by the LLM.
  status text check (status in ('resolved', 'needs_human', 'unknown')),
  confidence numeric check (confidence between 0 and 1),
  needs_human boolean not null default false,
  reason text
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

-- ---------------------------------------------------------------------------
-- knowledge_base: the ONLY source of truth the AI is allowed to answer from.
-- Deliberately a plain table (no vector/embedding columns) — a keyword/
-- category lookup is enough at demo scale and keeps the system deterministic
-- and easy to reason about. Revisit only if the real catalog of policies
-- grows large enough that a flat scan stops being "small."
-- ---------------------------------------------------------------------------
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  category text not null check (category in (
    'company_info',
    'shipping',
    'order_processing',
    'returns',
    'refunds',
    'warranty',
    'product_info',
    'contact_support'
  )),
  question text not null,
  answer text not null,

  -- Every row in this table is fictional demo content for a made-up
  -- e-commerce company (see supabase/seed.sql) — flagged explicitly so it's
  -- unmistakable in the dashboard/DB browser that nothing here is real.
  is_demo_data boolean not null default true
);

create index if not exists knowledge_base_category_idx on public.knowledge_base (category);

alter table public.knowledge_base enable row level security;

-- ---------------------------------------------------------------------------
-- escalations: created whenever the AI decides a human must take over.
-- ---------------------------------------------------------------------------
create table if not exists public.escalations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  conversation_id uuid not null references public.conversations (id) on delete cascade,
  message_id uuid references public.messages (id) on delete set null,

  reason text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  resolved_at timestamptz
);

create index if not exists escalations_status_idx on public.escalations (status);
create index if not exists escalations_conversation_id_idx on public.escalations (conversation_id);

alter table public.escalations enable row level security;
