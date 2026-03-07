-- ============================================
-- Permitir inserção de perfil no signup (trigger handle_new_user)
-- RLS bloqueava o INSERT. O trigger roda no contexto do Auth;
-- auth.uid() pode ser null. Usar função SECURITY DEFINER para
-- checar se o id existe em auth.users (o definer tem permissão).
-- ============================================
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Allow profile insert for new auth users" on public.profiles;

create or replace function public.is_id_in_auth_users(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from auth.users where id = uid);
$$;

create policy "Allow profile insert for new auth users"
  on public.profiles for insert
  with check (public.is_id_in_auth_users(id));

grant execute on function public.is_id_in_auth_users(uuid) to authenticated;
grant execute on function public.is_id_in_auth_users(uuid) to anon;
grant execute on function public.is_id_in_auth_users(uuid) to service_role;
