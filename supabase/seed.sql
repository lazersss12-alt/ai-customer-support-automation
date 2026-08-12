-- =============================================================================
-- DEMO DATA — Portfolio Project #2 (AI Customer Support Automation)
--
-- Everything in this file is FICTIONAL. "Northlane Goods" is not a real
-- company, and the conversations below are scripted demo interactions, not
-- real customer support transcripts. Run this after 0001_create_support_tables.sql.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Knowledge base: the only content the AI is allowed to answer from.
-- Fictional policies for "Northlane Goods", a made-up e-commerce company.
-- ---------------------------------------------------------------------------
insert into public.knowledge_base (category, question, answer, is_demo_data) values

-- 1. Company information
('company_info',
 'What is Northlane Goods?',
 'Northlane Goods is a fictional online retailer (demo company) selling outdoor and home essentials. This is a portfolio demo — Northlane Goods is not a real business.',
 true),
('company_info',
 'What are your business hours?',
 'Our support team is available Monday–Friday, 9 AM–6 PM ET, and Saturday, 10 AM–2 PM ET. We are closed on Sundays and major holidays.',
 true),

-- 2. Shipping
('shipping',
 'How long does shipping take?',
 'Standard orders are delivered within 3–5 business days. Expedited shipping (2 business days) is available at checkout for an additional fee.',
 true),
('shipping',
 'Do you ship internationally?',
 'Yes, we currently ship to the US, Canada, and the UK. International orders take 7–14 business days depending on customs processing.',
 true),
('shipping',
 'How much does shipping cost?',
 'Standard shipping is free on orders over $50. Orders under $50 have a flat $5.99 shipping fee. Expedited shipping is a flat $14.99.',
 true),

-- 3. Order processing
('order_processing',
 'How do I track my order?',
 'Once your order ships, you will receive a tracking link by email. You can also view order status by logging into your Northlane Goods account under "My Orders."',
 true),
('order_processing',
 'Can I change or cancel my order after placing it?',
 'Orders can be changed or canceled within 1 hour of placing them by contacting support. After that window, the order has usually already entered fulfillment and cannot be modified.',
 true),
('order_processing',
 'What payment methods do you accept?',
 'We accept all major credit and debit cards, PayPal, and Apple Pay.',
 true),

-- 4. Returns
('returns',
 'What is your return policy?',
 'Items can be returned within 30 days of delivery for a full refund, as long as they are unused and in original packaging. Final-sale items (marked as such on the product page) are not eligible for return.',
 true),
('returns',
 'How do I start a return?',
 'Log into your account, go to "My Orders," select the item, and click "Start a Return" to generate a prepaid return label.',
 true),

-- 5. Refunds
('refunds',
 'How long do refunds take?',
 'Refunds are issued to your original payment method within 5–7 business days after we receive and inspect the returned item.',
 true),
('refunds',
 'Do you offer partial refunds?',
 'Partial refunds may be issued for items returned outside the standard 30-day window or showing light wear, at the discretion of a support representative. This requires human review and is not something our automated assistant can approve on its own.',
 true),

-- 6. Warranty
('warranty',
 'Do your products have a warranty?',
 'Most Northlane Goods products include a 1-year limited warranty covering manufacturing defects. Electronics carry a 2-year limited warranty. Warranty does not cover normal wear and tear or accidental damage.',
 true),
('warranty',
 'How do I file a warranty claim?',
 'Contact support with your order number, a description of the issue, and a photo if possible. Approved claims are resolved with a replacement or store credit.',
 true),

-- 7. Product information
('product_info',
 'Are your products eco-friendly?',
 'Many Northlane Goods products use recycled or sustainably sourced materials — look for the "Eco" badge on product pages for details on that specific item.',
 true),
('product_info',
 'How do I know what size to order?',
 'Each product page includes a size guide with measurements. If you are between sizes, we generally recommend sizing up.',
 true),

-- 8. Contact / support information
('contact_support',
 'How can I contact a human at Northlane Goods?',
 'You can reach our support team by email at support@northlanegoods.example (demo address) or through this chat, which will connect you with a representative for anything our assistant can''t resolve.',
 true),
('contact_support',
 'Is phone support available?',
 'We currently offer support by email and live chat only. Phone support is not available at this time.',
 true);

-- ---------------------------------------------------------------------------
-- Demo conversations + messages
-- Clearly scripted examples, NOT real customer interactions, illustrating
-- the three possible AI outcomes: resolved, needs_human, unknown.
-- ---------------------------------------------------------------------------

-- Demo 1: resolved — shipping question
with c as (
  insert into public.conversations (customer_name, customer_email, status, latest_confidence)
  values ('Demo Customer — Jordan P.', 'demo.jordan@example.com', 'resolved', 0.96)
  returning id
)
insert into public.messages (conversation_id, role, content, status, confidence, needs_human, reason)
select id, 'customer', 'How long does shipping take?', null, null, false, null from c
union all
select id, 'ai',
  'Standard orders are delivered within 3–5 business days. Expedited shipping (2 business days) is available at checkout for an additional fee.',
  'resolved', 0.96, false, null
from c;

-- Demo 2: resolved — return window question
with c as (
  insert into public.conversations (customer_name, customer_email, status, latest_confidence)
  values ('Demo Customer — Ana R.', 'demo.ana@example.com', 'resolved', 0.94)
  returning id
)
insert into public.messages (conversation_id, role, content, status, confidence, needs_human, reason)
select id, 'customer', 'What is your return window?', null, null, false, null from c
union all
select id, 'ai',
  'Items can be returned within 30 days of delivery for a full refund, as long as they are unused and in original packaging.',
  'resolved', 0.94, false, null
from c;

-- Demo 3: needs_human — refund exception outside policy
with c as (
  insert into public.conversations (customer_name, customer_email, status, latest_confidence)
  values ('Demo Customer — Sam T.', 'demo.sam@example.com', 'needs_human', 0.42)
  returning id
),
m as (
  insert into public.messages (conversation_id, role, content, status, confidence, needs_human, reason)
  select id, 'customer', 'I want a refund outside the normal return period.', null, null, false, null from c
  union all
  select id, 'ai',
    'This request requires review by a support representative. Your conversation has been flagged for human assistance.',
    'needs_human', 0.42, true, 'The customer is requesting an exception to the refund policy.'
  from c
  returning id, conversation_id, role
)
insert into public.escalations (conversation_id, message_id, reason, status)
select m.conversation_id, m.id, 'The customer is requesting an exception to the refund policy.', 'open'
from m
where m.role = 'ai';

-- Demo 4: unknown — question the knowledge base can't answer
with c as (
  insert into public.conversations (customer_name, customer_email, status, latest_confidence)
  values ('Demo Customer — Priya K.', 'demo.priya@example.com', 'unknown', 0.38)
  returning id
)
insert into public.messages (conversation_id, role, content, status, confidence, needs_human, reason)
select id, 'customer', 'Can you guarantee delivery tomorrow?', null, null, false, null from c
union all
select id, 'ai',
  'I don''t have enough information in our knowledge base to confidently answer that. I''d recommend checking the expedited shipping option at checkout, or a support representative can confirm specific delivery guarantees for your area.',
  'unknown', 0.38, false, 'No knowledge base entry covers guaranteed next-day delivery.'
from c;
