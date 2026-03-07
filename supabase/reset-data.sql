-- ============================================
-- Reset de DADOS do Supabase (online/remoto)
-- ============================================
-- Use no SQL Editor do Dashboard do Supabase.
-- Apaga todos os dados das tabelas do app (mantém o schema).
-- NÃO apaga usuários de autenticação (auth.users).
-- ============================================

-- CASCADE permite truncar em qualquer ordem (resolve FKs entre as tabelas)
truncate table public.check_ins, public.members, public.events, public.profiles
  restart identity
  cascade;

-- Opcional: se quiser limpar também usuários de autenticação (cuidado!):
-- delete from auth.users;
