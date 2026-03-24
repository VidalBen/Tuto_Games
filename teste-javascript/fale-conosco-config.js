/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games contact / chat remote config
 * Purpose: Optional Supabase REST credentials for cross-device public chat. Leave empty to use local storage only.
 */
(function (global) {
  "use strict";

  /** @type {string} Project URL, e.g. https://xxxx.supabase.co */
  global.TUTO_SUPABASE_URL = "";

  /** @type {string} Supabase anon public key (RLS must allow select/insert on public_chat_messages). */
  global.TUTO_SUPABASE_ANON_KEY = "";
})(typeof window !== "undefined" ? window : globalThis);

/*
 * Optional Supabase setup (public chat across devices):
 *
 * create table public_chat_messages (
 *   id uuid primary key default gen_random_uuid(),
 *   username text not null,
 *   body text not null,
 *   created_at timestamptz not null default now()
 * );
 * alter table public_chat_messages enable row level security;
 * create policy "public read" on public_chat_messages for select using (true);
 * create policy "public insert" on public_chat_messages for insert with check (true);
 * create policy "public delete" on public_chat_messages for delete using (true);
 *
 * Enable Realtime on this table if you want live updates; REST polling in fale-conosco.js still works.
 */
