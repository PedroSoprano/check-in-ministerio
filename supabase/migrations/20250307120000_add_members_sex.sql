-- ============================================
-- Adicionar coluna sex em members (estatísticas por sexo)
-- ============================================
alter table public.members
  add column if not exists sex text
  check (sex is null or sex in ('M', 'F', 'outro'));

comment on column public.members.sex is 'Sexo do membro para estatísticas (M, F, outro); opcional.';
