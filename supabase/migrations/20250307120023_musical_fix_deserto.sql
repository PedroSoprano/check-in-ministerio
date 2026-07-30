-- Corrige elenco do Deserto conforme a planilha:
-- a partir de Rosely → entra pela Árvore
-- a partir de Susye → entra pela Prateleira
-- (mesmas peças em paralelo nos dois lados)

delete from public.cast_assignments
where piece_id in (
  'dddddddd-dddd-dddd-dddd-dddddddd0010',
  'dddddddd-dddd-dddd-dddd-dddddddd0011',
  'dddddddd-dddd-dddd-dddd-dddddddd0012',
  'dddddddd-dddd-dddd-dddd-dddddddd0013',
  'dddddddd-dddd-dddd-dddd-dddddddd0014'
);

insert into public.cast_assignments (piece_id, participant_id, entrance_side, note) values
  -- Árvore (a partir de Rosely)
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0008', 'arvore', 'Árvore'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0011', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0030', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0012', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0031', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0004', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0007', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0002', 'arvore', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0006', 'arvore', null),
  -- Prateleira (a partir de Susye)
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0005', 'prateleira', 'Prateleira'),
  ('dddddddd-dddd-dddd-dddd-dddddddd0011', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0032', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0012', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0033', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0034', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0035', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0016', 'prateleira', null),
  ('dddddddd-dddd-dddd-dddd-dddddddd0013', 'eeeeeeee-eeee-eeee-eeee-eeeeeeee0036', 'prateleira', null);
