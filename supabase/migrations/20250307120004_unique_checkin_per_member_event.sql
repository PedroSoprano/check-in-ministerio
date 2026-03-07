-- ============================================
-- Um check-in por membro por evento (ou por dia quando sem evento)
-- Evita duplicidade: mesmo membro não pode fazer check-in duas vezes
-- no mesmo evento ou duas vezes no mesmo dia quando não há evento.
-- ============================================

-- Quando há evento: único (member_id, event_id)
create unique index if not exists check_ins_member_event_unique
  on public.check_ins (member_id, event_id)
  where event_id is not null;

-- Quando não há evento: único (member_id, dia) — uso de UTC para índice ser IMMUTABLE
create unique index if not exists check_ins_member_day_unique
  on public.check_ins (member_id, ((created_at AT TIME ZONE 'UTC')::date))
  where event_id is null;
