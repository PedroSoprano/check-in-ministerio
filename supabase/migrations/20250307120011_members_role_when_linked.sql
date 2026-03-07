-- ============================================
-- Função no sistema quando o membro vincular conta
-- Usado na criação/edição do membro; aplicado ao profile ao fazer login
-- ============================================
alter table public.members
  add column if not exists role_when_linked text default 'user'
  check (role_when_linked is null or role_when_linked in ('user', 'admin'));

comment on column public.members.role_when_linked is 'Função (user/admin) a aplicar ao perfil quando o membro vincular a conta pelo e-mail.';
