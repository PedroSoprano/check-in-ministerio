-- ============================================
-- Usuário pode ver e atualizar apenas o membro vinculado a ele (user_id)
-- Usado na página "Meu perfil" para editar os próprios dados do membro
-- ============================================
create policy "Users can view own linked member"
  on public.members for select
  using (user_id = auth.uid());

create policy "Users can update own linked member"
  on public.members for update
  using (user_id = auth.uid());
