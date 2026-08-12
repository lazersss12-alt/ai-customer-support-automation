# AI Customer Support Automation

A portfolio/demo project: an AI support assistant that answers customer questions from a
fixed knowledge base — and honestly hands off to a human when it can't — for **Northlane
Goods**, a fictional e-commerce company invented for this demo.

> **This is a portfolio/demo project, not a real client deployment.** Northlane Goods is not
> a real company. All knowledge base content, conversations, and statistics you see in the
> demo/seed data are fictional or clearly marked as such — nothing here represents real
> customers, real policies, or real business metrics.

## Overview

| Piece | What it does |
|---|---|
| `web/` (Next.js) | Public support chat + internal `/dashboard` |
| `n8n` | Orchestrates the support workflow (webhook → knowledge base → LLM → Supabase) |
| OpenRouter | LLM provider for the AI's decision (currently a free-tier model) |
| Supabase | Postgres database storing conversations, messages, knowledge base, escalations |

## Business problem & solution

Most customer support volume is repetitive: shipping timelines, return windows, warranty
terms. A human answering the same five questions all day is expensive and slow, but a bot
that confidently makes up an answer is worse than no bot at all. This project demonstrates a
middle path: an AI assistant that **only** answers from a fixed, auditable knowledge base,
returns a structured decision (not just prose) about how confident it is, and — critically —
recognizes when a request needs a human (a refund exception, a complaint) and says so
instead of guessing.

## Architecture

```
   web/ (Next.js)
   ├─ "/"          public support chat ──POST──▶ n8n webhook
   └─ "/dashboard" internal, Basic-Auth-protected, reads Supabase directly (server-side)
                          │
                          ▼
              POST /webhook/customer-support
                          │
                          ▼
                     n8n Webhook
                          │
                          ▼
                  Validate Message ──(empty/too long)──▶ 400 response
                          │
                          ▼
      Has Conversation ID? ──yes──▶ reuse it ─┐
              │no                              │
              ▼                                │
      Create Conversation (Supabase)           │
              │                                │
              └──────────────┬─────────────────┘
                              ▼
                 Insert Customer Message (Supabase)
                              │
                              ▼
          Get Knowledge Base + Get Recent History (Supabase)
                              │
                              ▼
                    Build Prompt Context (Code node)
                              │
                              ▼
            AI Support Response (Basic LLM Chain)
            │                                  │
            ▼                                  ▼
   OpenRouter Chat Model              Structured Output Parser
   (free-tier model)                  (enforces JSON schema:
                                        answer/status/confidence/
                                        needs_human/reason)
                              │
                              ▼
                  Insert AI Message (Supabase)
                              │
                              ▼
                   Update Conversation (Supabase)
                              │
                              ▼
              needs_human? ──yes──▶ Insert Escalation (Supabase)
                    │no                        │
                    └────────────┬─────────────┘
                                 ▼
                     Respond to Webhook (JSON)
```

Workflow source of truth: `n8n/workflows/customer-support.json` (importable via n8n's API or
UI — re-import after any manual edits in the n8n editor to keep this file current). This file
is the actual export of the workflow after it was built and imported into a real local n8n
instance during development — see "How this was verified" below.

## Features

- Customer-facing chat with empty, loading, typing, error, and escalation states
- AI answers are constrained to a fixed knowledge base — no free-form hallucinated policy
- Structured AI decision (`answer` / `status` / `confidence` / `needs_human` / `reason`) on
  every turn, enforced by a JSON schema output parser, independent of prompt wording
- Multi-turn conversations: the assistant sees recent history, not just the latest message
- Automatic human escalation: flagged in Supabase, reflected to the customer, visible on the
  dashboard — no WhatsApp/SMS/Slack/email/ticketing integration in this V1, by design
- Internal dashboard: totals, filterable conversation list, full per-conversation transcript
  with status/confidence/escalation reason
- `/dashboard` gated by HTTP Basic Auth; Supabase only ever touched server-side with the
  service-role key

## Tech stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Automation**: n8n (webhook trigger, Basic LLM Chain, structured output parser, Supabase
  nodes, Code node for deterministic context building)
- **LLM**: OpenRouter (`openai/gpt-oss-20b:free` by default — swappable, see below)
- **Database**: Supabase (Postgres + RLS, accessed via the Supabase REST API)

## Database structure

Four tables, isolated from Project 1's `leads` table (same Supabase project, different
tables — nothing here touches Project 1):

- **`conversations`** — one row per chat session. `status` mirrors the most recent AI
  message's status (`open` until the first AI reply, then `resolved` / `needs_human` /
  `unknown`) so the dashboard can list/filter without joining `messages`.
- **`messages`** — every customer and AI turn. AI rows carry the structured decision
  (`status`, `confidence`, `needs_human`, `reason`); customer rows leave those null.
- **`knowledge_base`** — the *only* source of truth the AI is allowed to answer from. Plain
  rows (`category`, `question`, `answer`), no embeddings — a flat table is genuinely enough
  at this scale and keeps the system deterministic and auditable. Every row is flagged
  `is_demo_data = true`. **No vector database was introduced on purpose** — see "Known
  limitations" for when that tradeoff would need revisiting.
- **`escalations`** — created whenever an AI message has `needs_human = true`, linking back
  to the conversation and the triggering message.

All four have row-level security enabled with no public policies — only a service-role
client (the n8n workflow, and the dashboard's server-side data layer) can read or write them,
identical to Project 1's `leads` table pattern.

Migration: `supabase/migrations/0001_create_support_tables.sql`. Demo data (knowledge base +
4 example conversations covering resolved/needs_human/unknown): `supabase/seed.sql`.

## AI behavior

The prompt instructs the model to answer **only** from the knowledge base text it's given
(fetched fresh from Supabase on every turn, not baked into the prompt statically) and to
pick one of three outcomes:

- **`resolved`** — the knowledge base clearly answers the question; confident, specific
  answer; `confidence >= 0.7`.
- **`needs_human`** — the request needs human judgment (a policy exception, a complaint, a
  refund outside normal terms); brief acknowledgement as the answer; `reason` explains why.
- **`unknown`** — the knowledge base doesn't cover it; the model is instructed to say so
  honestly (`confidence < 0.5`) instead of guessing.

A **Structured Output Parser** node enforces the JSON schema (`answer`, `status`,
`confidence`, `needs_human`, `reason`) independent of the model or prompt wording — the same
pattern Project 1 used for its qualification schema.

### Switching LLM providers

The LLM call is isolated behind two nodes, by design:

1. Open the workflow in the n8n editor.
2. Detach the **OpenRouter Chat Model** sub-node from **AI Support Response**.
3. Add and connect a different Chat Model sub-node (OpenAI, Anthropic, or a different
   OpenRouter model), pointing it at the appropriate credential.
4. Nothing else changes — the prompt, the Structured Output Parser, and all Supabase nodes
   are provider-independent.

## Local setup

Prerequisites: Node.js, a free [OpenRouter](https://openrouter.ai) account, a free
[Supabase](https://supabase.com) project (can be the same project used for Project 1 — this
only adds new tables).

1. **Database.** In the Supabase SQL Editor, run:
   - `supabase/migrations/0001_create_support_tables.sql` (creates the 4 tables with RLS)
   - `supabase/seed.sql` (optional but recommended for the demo — inserts the knowledge base
     and 4 example conversations, all clearly marked as demo data)

2. **n8n.**
   ```
   npx n8n start
   ```
   Starts n8n on `http://localhost:5678`. First run requires creating a local owner account
   through the browser.

3. **Import the workflow.** Import `n8n/workflows/customer-support.json` (UI: Import from
   File, or via the REST API with your n8n API key). Attach two credentials to the imported
   nodes:
   - **OpenRouter** credential (`openRouterApi` type) — your OpenRouter API key.
   - **Supabase** credential (`supabaseApi` type) — your Supabase project URL and
     **secret/service_role** key. Six nodes need this credential attached (Create
     Conversation, Insert Customer Message, Get Knowledge Base, Get Recent History, Insert AI
     Message, Update Conversation, Insert Escalation).

   Activate the workflow once both credentials are attached.

4. **Expose the webhook publicly** (only needed if the frontend isn't running on the same
   machine as n8n):
   ```
   cloudflared tunnel --url http://localhost:5678
   ```
   For local development, `http://localhost:5678` works directly in `NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL`.

5. **Frontend.**
   ```
   cd web
   npm install
   npm run dev
   ```
   Copy `web/.env.example` to `web/.env.local` and fill in the values (see below). Visit
   `http://localhost:3000` for the chat, `http://localhost:3000/dashboard` for the dashboard.

## Environment variables

**`web/.env.local`** (see `web/.env.example`):

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL` | Browser (chat) | Public by design — just a webhook URL the chat posts to. `http://localhost:5678/webhook/customer-support` locally. |
| `SUPABASE_URL` | Server only (dashboard) | No `NEXT_PUBLIC_` prefix. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (dashboard) | **Never** prefix with `NEXT_PUBLIC_`. Only read inside `web/src/lib/supabase-admin.ts`. |
| `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` | Server only (`proxy.ts`) | Gates `/dashboard` with HTTP Basic Auth. |

**`.env`** (repo root, see `.env.example`): `OPENROUTER_API_KEY`, `N8N_API_KEY`,
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — reference copies for scripting against n8n's/
Supabase's APIs directly. n8n stores its actual credentials encrypted in its own internal
database, not by reading this file.

All `.env`/`.env.local` files are gitignored; only `.env.example` templates are committed.
No OpenRouter key, Supabase secret/service-role key, n8n API key, password, or token is
hardcoded anywhere in this project.

## Testing

### How this was verified during development

A local n8n instance was already running on this machine (it hosts Project 1's workflow), so
rather than hand-authoring the workflow JSON blind, it was built against the *actual*
installed n8n node schemas (read directly from the installed `n8n-nodes-base` package) and
then:

1. **Imported via n8n's REST API** — confirmed all 19 nodes and every connection are
   structurally valid (HTTP 200, no schema errors).
2. **Temporarily activated and sent a real POST** to `/webhook/customer-support` with a
   valid message. The execution log confirmed: the webhook fired, **Validate Message**
   correctly passed a well-formed message through, **Has Conversation ID** correctly routed
   a first-time request to the "create new conversation" branch, and the Supabase credential
   authenticated successfully against the real project — it stopped at **Create
   Conversation** with a clean `Could not find the table 'public.conversations'` error,
   because the migration in step 1 above hadn't been applied yet in that project.
3. Deactivated the workflow again afterward (left inactive pending the migration).

This confirms the webhook trigger, message validation, conversation-routing logic, and
Supabase authentication all work correctly. The remainder of the pipeline (knowledge base
retrieval, the OpenRouter call, structured parsing, message/escalation writes) is exercised
the first time a real request completes after the migration is applied — see "Manual
verification" below.

`web/` itself was verified locally: TypeScript typecheck, ESLint, and `next build` all pass
(see the implementation report for exact results).

### Manual verification (do this after applying the migration)

Once `0001_create_support_tables.sql` has been run against your Supabase project and the
workflow is imported/activated with both credentials attached, test all 6 required scenarios
with curl:

```bash
# 1. FAQ → resolved
curl -X POST http://localhost:5678/webhook/customer-support \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","message":"What is your return policy?"}'

# 2. Shipping → resolved
curl -X POST http://localhost:5678/webhook/customer-support \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","message":"How long does shipping take?"}'

# 3. Return → resolved
curl -X POST http://localhost:5678/webhook/customer-support \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","message":"What is your return window?"}'

# 4. Unknown question → unknown
curl -X POST http://localhost:5678/webhook/customer-support \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","message":"Can you guarantee delivery tomorrow?"}'

# 5. Refund exception → needs_human
curl -X POST http://localhost:5678/webhook/customer-support \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","message":"I want a refund outside the normal return period."}'

# 6. Empty message → validation error
curl -X POST http://localhost:5678/webhook/customer-support \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","message":""}'
# Expect HTTP 400 and {"error":"Message is required and must be 2000 characters or fewer."}
```

Expect `{"conversation_id", "answer", "status", "confidence", "needs_human", "reason"}` for
1–5, with `status` matching the scenario, and a matching new row in Supabase's `messages`
table (and an `escalations` row for #5), visible on `/dashboard`.

Then verify the chat UI end-to-end in a browser: send a message on `/`, confirm the typing
indicator appears then resolves to a bubble with the right status badge; trigger the
`needs_human` case and confirm the escalation banner appears; try sending an empty message
and confirm the input blocks it client-side.

## Demo instructions

`supabase/seed.sql` inserts 4 example conversations (shipping → resolved, return window →
resolved, refund exception → needs_human, delivery guarantee → unknown) plus the full 8-
category knowledge base, so `/dashboard` has something to show immediately without needing to
run the chat first. All of it is explicitly fictional demo data (see the file header).

## Known limitations

- No vector database / RAG — deliberate for this scale (a handful of demo KB entries); if a
  real deployment's knowledge base grew to hundreds of long articles, a flat "fetch every
  row" context would stop being efficient and a retrieval step would become worth the added
  complexity.
- No WhatsApp/SMS/Slack/email/ticketing integration for escalations — V1 only writes to
  Supabase and surfaces it in the dashboard, by design (see spec).
- n8n runs via `npx`, not persisted — process/data resets if killed without a mounted data
  directory or a move to Docker/n8n Cloud (same limitation as Project 1).
- No retry/dead-letter handling on Supabase insert failures.
- Conversation history passed to the model is capped at the last 6 messages — fine for a
  demo, would need a summarization step for very long conversations.
- The chat UI's conversation continuity relies on the browser holding `conversation_id` in
  memory for the session; refreshing the page starts a new conversation (no persistence to
  localStorage in V1).

## Future improvements

- Persist `conversation_id` client-side (localStorage) so a page refresh doesn't lose thread
  continuity.
- Real escalation delivery (email/Slack notification when a row lands in `escalations`).
- Move dashboard auth from HTTP Basic to a real session-based login if this ever needed
  multiple operators.
- Promote the knowledge base to a searchable/paginated admin view instead of editing rows
  directly in Supabase.
