-- ============================================
-- Reset de DADOS do Supabase (online/remoto)
-- ============================================
-- Use no SQL Editor do Dashboard do Supabase.
-- Apaga todos os dados das tabelas do app (mantém o schema).
-- NÃO apaga usuários de autenticação (auth.users).
-- ============================================

-- Ordem: tabelas que referenciam outras primeiro
truncate table public.check_ins;
truncate table public.members;
truncate table public.events;
truncate table public.profiles;

-- Opcional: se quiser limpar também usuários de autenticação (cuidado!):
-- delete from auth.users;
