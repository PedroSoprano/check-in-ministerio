-- Corrige sessões do Musical: apresentações em ago/2026; remove ensaios fictícios 08-09/08;
-- adiciona ensaio de exemplo em 30/07/2026 (para testes / "amanhã" no lançamento).
delete from public.musical_sessions
where id in (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002'
);

insert into public.musical_sessions (id, production_id, session_date, session_time, type, title) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '2026-07-30', '19:00', 'ensaio', 'Ensaio Musical Aladin')
on conflict (id) do update
  set session_date = excluded.session_date,
      session_time = excluded.session_time,
      type = excluded.type,
      title = excluded.title;

update public.musical_sessions
set type = 'apresentacao',
    title = 'Apresentação Musical Aladin',
    session_time = '19:00'
where id in (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0005',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0006',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0007'
);
