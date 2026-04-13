-- Replace Telegram with Discord webhook URL
alter table public.users
  add column if not exists discord_webhook_url text;

-- Drop old Telegram column (safe to do after confirming no active users need it)
alter table public.users
  drop column if exists telegram_chat_id;

-- Drop the telegram_link_codes table entirely
drop table if exists public.telegram_link_codes;
