-- ============================================
-- Vínculo automático: member por email do usuário logado
-- Chamada após signup/login para ligar member.user_id = auth.uid()
-- quando members.email = email do usuário e user_id ainda é null
-- ============================================
create or replace function public.link_member_by_auth_email()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  updated_count integer;
begin
  user_email := coalesce(
    auth.jwt()->>'email',
    (select email from auth.users where id = auth.uid())
  );
  if user_email is null or user_email = '' then
    return 0;
  end if;

  update public.members
  set user_id = auth.uid(), updated_at = now()
  where lower(trim(email)) = lower(trim(user_email))
    and (user_id is null or user_id != auth.uid());

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.link_member_by_auth_email() to authenticated;
grant execute on function public.link_member_by_auth_email() to service_role;

comment on function public.link_member_by_auth_email() is 'Vincula o member cujo email coincide com o do usuário autenticado (para vínculo automático após login/signup).';
