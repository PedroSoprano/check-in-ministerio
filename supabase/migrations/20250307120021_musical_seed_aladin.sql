-- ============================================
-- Seed Musical Aladin (14/08 a 23/08/2026)
-- Participantes e elenco da planilha (com correções manuscritas aplicadas)
-- ============================================

-- Produção
insert into public.productions (id, title, start_date, end_date, active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Musical Aladin', '2026-08-14', '2026-08-23', true)
on conflict (id) do nothing;

-- Sessões: apresentações (14/08–23/08) + ensaio de exemplo (amanhã relativo ao lançamento local)
insert into public.musical_sessions (id, production_id, session_date, session_time, type, title) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '2026-07-30', '19:00', 'ensaio', 'Ensaio Musical Aladin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '2026-08-14', '19:00', 'apresentacao', 'Apresentação Musical Aladin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '2026-08-15', '19:00', 'apresentacao', 'Apresentação Musical Aladin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '2026-08-16', '19:00', 'apresentacao', 'Apresentação Musical Aladin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '2026-08-22', '19:00', 'apresentacao', 'Apresentação Musical Aladin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '2026-08-23', '19:00', 'apresentacao', 'Apresentação Musical Aladin')
on conflict (id) do nothing;

-- Cenas
insert into public.musical_scenes (id, production_id, name, sort_order) values
  ('cccccccc-cccc-cccc-cccc-cccccccc0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Cidade', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccc0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Deserto', 2),
  ('cccccccc-cccc-cccc-cccc-cccccccc0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Cacto e Jardim', 3),
  ('cccccccc-cccc-cccc-cccc-cccccccc0004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Passáros', 4),
  ('cccccccc-cccc-cccc-cccc-cccccccc0005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Estrela', 5),
  ('cccccccc-cccc-cccc-cccc-cccccccc0006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Nuvem', 6),
  ('cccccccc-cccc-cccc-cccc-cccccccc0007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Lua', 7),
  ('cccccccc-cccc-cccc-cccc-cccccccc0008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Elefante', 8),
  ('cccccccc-cccc-cccc-cccc-cccccccc0009', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Abú', 9),
  ('cccccccc-cccc-cccc-cccc-cccccccc0010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Rajar', 10)
on conflict (id) do nothing;

-- Peças
insert into public.musical_pieces (id, scene_id, name, sort_order) values
  -- Cidade
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'cccccccc-cccc-cccc-cccc-cccccccc0001', 'Cidade', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0002', 'cccccccc-cccc-cccc-cccc-cccccccc0001', 'Coqueiro', 2),
  -- Deserto
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'cccccccc-cccc-cccc-cccc-cccccccc0002', 'Coqueiro', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0011', 'cccccccc-cccc-cccc-cccc-cccccccc0002', 'Camelo', 2),
  ('dddddddd-dddd-dddd-dddd-dddddddd0012', 'cccccccc-cccc-cccc-cccc-cccccccc0002', 'Duna Grande', 3),
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'cccccccc-cccc-cccc-cccc-cccccccc0002', 'Duna Pequena', 4),
  ('dddddddd-dddd-dddd-dddd-dddddddd0014', 'cccccccc-cccc-cccc-cccc-cccccccc0002', 'Ilha', 5),
  -- Cacto e Jardim
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'cccccccc-cccc-cccc-cccc-cccccccc0003', 'Elenco', 1),
  -- Passáros, Estrela, Nuvem, Lua, Elefante, Abú, Rajar
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'cccccccc-cccc-cccc-cccc-cccccccc0004', 'Elenco', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0031', 'cccccccc-cccc-cccc-cccc-cccccccc0005', 'Elenco', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0032', 'cccccccc-cccc-cccc-cccc-cccccccc0006', 'Elenco', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0033', 'cccccccc-cccc-cccc-cccc-cccccccc0007', 'Elenco', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0034', 'cccccccc-cccc-cccc-cccc-cccccccc0008', 'Elenco', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0035', 'cccccccc-cccc-cccc-cccc-cccccccc0009', 'Elenco', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddd0036', 'cccccccc-cccc-cccc-cccc-cccccccc0010', 'Elenco', 1)
on conflict (id) do nothing;

-- Participantes (nomes únicos da planilha, após correções)
insert into public.musical_participants (id, production_id, name) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Talita'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Alziane'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Aldemize'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Raiza'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Susye'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Jamila'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Marcos'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Rosely'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0009', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Rosana'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Ana Paula'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0011', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Lucineide'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0012', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Rosenir'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0013', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Neires'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0014', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Ryanne'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0015', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Gabriele'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0016', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Adilson'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0017', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Emily'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0018', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Hellen'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0019', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Monica'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0020', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Lidiane'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0021', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Adriana'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0022', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Nathan'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0023', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Alexandre'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0024', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Suelen'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0025', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Consuelo'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0030', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Robert'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0031', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Nicole'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0032', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Sidney'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0033', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Eduardo'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0034', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Gabriel'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0035', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Diogo'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0036', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Thatyana'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0040', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Arthur'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0041', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Breno'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0042', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Richardson'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0043', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Elen'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0044', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Claudinete'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0045', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Izabel'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0046', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Vanessa'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0047', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Daniella'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0050', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'André Carlos'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0051', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Edson'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0052', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Erick Pequeno'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0053', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Inacio'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0054', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Isaac'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0055', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Mirilene Moraes'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0056', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Paulo Wendell'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0057', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Pedro'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0058', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Rejanny'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0059', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Roney'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0060', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Vitor Estevam'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0061', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Raimunda'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0062', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Hanna'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0063', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Marilson'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0064', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Geybson'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0065', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Elton'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0066', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Fabio Amorim'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeee0067', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'Júlio')
on conflict (id) do nothing;

-- Vincular a members existentes quando o nome bate (best-effort)
update public.musical_participants p
set member_id = m.id
from public.members m
where p.production_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'
  and p.member_id is null
  and (
    lower(trim(m.name)) = lower(trim(p.name))
    or lower(trim(m.name)) like lower(trim(p.name)) || ' %'
    or lower(trim(m.name)) like '% ' || lower(trim(p.name))
  );

-- Assignments: Cidade — Árvore
insert into public.cast_assignments (piece_id, participant_id, entrance_side, note) values
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0001', 'arvore', 'Árvore'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0005', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0006', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0007', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0008', 'arvore', null), -- Rosely · Coqueiro (Cidade)
  -- Cidade — Prateleira
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0009', 'prateleira', 'Prateleira'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0010', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0011', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0012', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0013', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0014', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0015', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0016', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0017', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0018', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0019', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0020', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0021', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0022', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0023', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0024', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0025', 'prateleira', null)
on conflict (piece_id, participant_id) do nothing;

-- Deserto: grupo Rosely → Árvore; grupo Susye → Prateleira (mesmas peças em paralelo)
insert into public.cast_assignments (piece_id, participant_id, entrance_side, note) values
  -- Árvore (a partir de Rosely)
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0008', 'arvore', 'Árvore'), -- Rosely · Coqueiro
  ('dddddddd-dddd-dddd-dddd-dddddddd0011', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0030', 'arvore', null), -- Robert · Camelo
  ('dddddddd-dddd-dddd-dddd-dddddddd0012', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0031', 'arvore', null), -- Nicole · Duna Grande
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'arvore', null), -- Raiza · Coqueiro
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0007', 'arvore', null), -- Marcos · Duna Pequena
  ('dddddddd-dddd-dddd-dddd-dddddddd0014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'arvore', null), -- Alziane · Ilha
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0006', 'arvore', null), -- Jamila · Duna Pequena
  -- Prateleira (a partir de Susye)
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0005', 'prateleira', 'Prateleira'), -- Susye · Coqueiro
  ('dddddddd-dddd-dddd-dddd-dddddddd0011', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0032', 'prateleira', null), -- Sidney · Camelo
  ('dddddddd-dddd-dddd-dddd-dddddddd0012', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0033', 'prateleira', null), -- Eduardo · Duna Grande
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0034', 'prateleira', null), -- Gabriel · Coqueiro
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0035', 'prateleira', null), -- Diogo · Duna Pequena
  ('dddddddd-dddd-dddd-dddd-dddddddd0014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0016', 'prateleira', null), -- Adilson · Ilha
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0036', 'prateleira', null) -- Thatyana · Duna Pequena
on conflict (piece_id, participant_id) do nothing;

-- Cacto e Jardim — Prateleira / Árvore
insert into public.cast_assignments (piece_id, participant_id, entrance_side, note) values
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0040', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0041', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0042', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0043', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0044', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0045', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0046', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0047', 'arvore', null)
on conflict (piece_id, participant_id) do nothing;

-- Passáros
insert into public.cast_assignments (piece_id, participant_id, entrance_side, note) values
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0003', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0050', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0051', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0052', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0053', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0054', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0055', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0056', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0057', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0058', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0059', null, null)
on conflict (piece_id, participant_id) do nothing;

-- Estrela, Nuvem, Lua, Elefante, Abú
insert into public.cast_assignments (piece_id, participant_id, entrance_side, note) values
  ('dddddddd-dddd-dddd-dddd-dddddddd0031', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0060', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0031', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0061', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0031', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0062', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0032', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0063', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0032', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0064', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0032', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0065', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0032', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0066', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0033', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0067', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0034', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0022', null, 'Nathan - Isaac'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0034', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0054', null, 'Nathan - Isaac'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0034', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0056', null, 'Paulo Wendell - Edson'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0034', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0051', null, 'Paulo Wendell - Edson'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0035', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0009', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0035', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0055', null, null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0035', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0011', null, null)
on conflict (piece_id, participant_id) do nothing;
