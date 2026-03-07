-- ============================================
-- Permitir que admins atualizem a role de qualquer perfil
-- (para promover/rebaixar usuários na edição de membros)
-- ============================================
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());
