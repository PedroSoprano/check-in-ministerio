-- ============================================
-- Horário de fim do evento (para Google Agenda e exibição)
-- ============================================
alter table public.events
  add column if not exists event_time_end time;

comment on column public.events.event_time_end is 'Horário de término do evento; opcional.';
