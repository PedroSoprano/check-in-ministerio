-- ============================================
-- Corrigir recursão infinita nas policies de profiles
-- A policy "Admins can view all profiles" lia profiles de dentro da própria
-- policy, causando recursão. Usar função SECURITY DEFINER que lê profiles
-- sem disparar RLS.
-- ============================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Remover a policy que causa recursão e recriar usando is_admin()
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Atualizar as outras policies que checavam admin via subquery em profiles
drop policy if exists "Admins can manage members" on public.members;
create policy "Admins can manage members"
  on public.members for all
  using (public.is_admin());

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
  on public.events for all
  using (public.is_admin());

drop policy if exists "Admins can manage all check-ins" on public.check_ins;
create policy "Admins can manage all check-ins"
  on public.check_ins for all
  using (public.is_admin());

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;
