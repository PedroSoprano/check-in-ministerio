-- ============================================
-- Seed - Ministério de Fantoches NIBTB 2026
-- Apenas dados extraídos da planilha (sem inventar)
-- Ensaios: 21/02/26 e 28/02/26
-- ============================================

-- Membros - nomes extraídos da planilha; email onde informado
-- birth_date: preenchido onde havia na planilha (DD/MM → ano 1990)
-- matricula_senib: não constava na planilha → null
insert into public.members (id, name, email, matricula_senib, birth_date) values
  ('11111111-1111-1111-1111-000000000001', 'Aldemize Castro', null, null, '1990-12-22'),
  ('11111111-1111-1111-1111-000000000002', 'Alexsandre', null, null, '1990-11-12'),
  ('11111111-1111-1111-1111-000000000003', 'Alziane', null, null, '1990-11-01'),
  ('11111111-1111-1111-1111-000000000004', 'Arthur Emanuel', null, null, '1990-11-03'),
  ('11111111-1111-1111-1111-000000000005', 'Breno', null, null, '1990-02-27'),
  ('11111111-1111-1111-1111-000000000006', 'Claudinete', null, null, '1990-07-28'),
  ('11111111-1111-1111-1111-000000000007', 'Consuelo', null, null, '1990-03-15'),
  ('11111111-1111-1111-1111-000000000008', 'Edson', null, null, '1990-04-03'),
  ('11111111-1111-1111-1111-000000000009', 'Erick Pequeno', null, null, '1990-09-28'),
  ('11111111-1111-1111-1111-000000000010', 'Gisele', null, null, '1990-01-25'),
  ('11111111-1111-1111-1111-000000000011', 'Isis Rebeca', null, null, '1990-12-07'),
  ('11111111-1111-1111-1111-000000000012', 'Izabel Matos', null, null, '1990-09-20'),
  ('11111111-1111-1111-1111-000000000013', 'Jamila Penha', null, null, '1990-02-02'),
  ('11111111-1111-1111-1111-000000000014', 'Karine', null, null, '1990-05-24'),
  ('11111111-1111-1111-1111-000000000015', 'Lene Freire', null, null, '1990-08-25'),
  ('11111111-1111-1111-1111-000000000016', 'Leomar', null, null, '1990-08-31'),
  ('11111111-1111-1111-1111-000000000017', 'Lidiane Amorim', null, null, null),
  ('11111111-1111-1111-1111-000000000018', 'Lucineide', null, null, '1990-02-09'),
  ('11111111-1111-1111-1111-000000000019', 'Mara Matos', null, null, '1990-06-24'),
  ('11111111-1111-1111-1111-000000000020', 'Marcos Sergio', null, null, '1990-01-22'),
  ('11111111-1111-1111-1111-000000000021', 'Mirilene Moraes', null, null, '1990-09-16'),
  ('11111111-1111-1111-1111-000000000022', 'Mônica Érica', null, null, '1990-06-03'),
  ('11111111-1111-1111-1111-000000000023', 'Nathan Lima', null, null, '1990-04-13'),
  ('11111111-1111-1111-1111-000000000024', 'Nicolly Lima', null, null, '1990-05-16'),
  ('11111111-1111-1111-1111-000000000025', 'Paulo Wendell', null, null, '1990-11-14'),
  ('11111111-1111-1111-1111-000000000026', 'Pedro Henrique Souza Soprano', 'vonhishi@gmail.com', null, '1990-12-21'),
  ('11111111-1111-1111-1111-000000000027', 'Raimunda Vasconcelos', null, null, '1990-01-09'),
  ('11111111-1111-1111-1111-000000000028', 'Richardson', null, null, '1990-06-11'),
  ('11111111-1111-1111-1111-000000000029', 'Roney', null, null, '1990-12-07'),
  ('11111111-1111-1111-1111-000000000030', 'Rosana Modesto', null, null, '1990-06-07'),
  ('11111111-1111-1111-1111-000000000031', 'Rosely', null, null, '1990-05-11'),
  ('11111111-1111-1111-1111-000000000032', 'Sidney de Matos', null, null, '1990-12-19'),
  ('11111111-1111-1111-1111-000000000033', 'Susye Barreto', null, null, '1990-12-02'),
  ('11111111-1111-1111-1111-000000000034', 'Talita Souza', null, null, '1990-09-09'),
  ('11111111-1111-1111-1111-000000000035', 'Valderly', null, null, '1990-11-11'),
  ('11111111-1111-1111-1111-000000000036', 'Vitor Estevam', null, null, '1990-09-26'),
  ('11111111-1111-1111-1111-000000000037', 'Vitor Freire', null, null, '1990-02-07'),
  ('11111111-1111-1111-1111-000000000038', 'Willian Trindade', null, null, null)
on conflict (id) do nothing;

-- Eventos - Ensaios 14:30–17h (sábados de março 2025 e 2026)
-- Descrição com avisos para todos os ensaios
insert into public.events (id, title, event_date, event_time, event_time_end, type, description, recurrence_rule) values
  ('22222222-2222-2222-2222-222222222201', 'Ensaio Ministério Fantoches', '2025-03-07', '14:30', '17:00', 'ensaio', E'- Não esqueça de trazer a sua luva.\n- Evite o uso de celular durante o ministério.\n- Evite conversar durante as instruções do líder.\n- Não esqueça de vir com uma camisa grande (nada de camisa curta).', 'weekly'),
  ('22222222-2222-2222-2222-222222222202', 'Ensaio Ministério Fantoches', '2026-03-07', '14:30', '17:00', 'ensaio', E'- Não esqueça de trazer a sua luva.\n- Evite o uso de celular durante o ministério.\n- Evite conversar durante as instruções do líder.\n- Não esqueça de vir com uma camisa grande (nada de camisa curta).', 'weekly'),
  ('22222222-2222-2222-2222-222222222203', 'Ensaio Ministério Fantoches', '2026-03-14', '14:30', '17:00', 'ensaio', E'- Não esqueça de trazer a sua luva.\n- Evite o uso de celular durante o ministério.\n- Evite conversar durante as instruções do líder.\n- Não esqueça de vir com uma camisa grande (nada de camisa curta).', 'weekly'),
  ('22222222-2222-2222-2222-222222222204', 'Ensaio Ministério Fantoches', '2026-03-21', '14:30', '17:00', 'ensaio', E'- Não esqueça de trazer a sua luva.\n- Evite o uso de celular durante o ministério.\n- Evite conversar durante as instruções do líder.\n- Não esqueça de vir com uma camisa grande (nada de camisa curta).', 'weekly'),
  ('22222222-2222-2222-2222-222222222205', 'Ensaio Ministério Fantoches', '2026-03-28', '14:30', '17:00', 'ensaio', E'- Não esqueça de trazer a sua luva.\n- Evite o uso de celular durante o ministério.\n- Evite conversar durante as instruções do líder.\n- Não esqueça de vir com uma camisa grande (nada de camisa curta).', 'weekly')
on conflict (id) do nothing;
