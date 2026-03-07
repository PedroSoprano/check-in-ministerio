-- ============================================
-- Ao vincular membro por e-mail, aplicar role_when_linked ao profile
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
  member_role text;
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

  if updated_count > 0 then
    select role_when_linked into member_role
    from public.members
    where user_id = auth.uid()
    limit 1;
    update public.profiles
    set role = coalesce(nullif(trim(member_role), ''), 'user')
    where id = auth.uid()
      and (role is distinct from coalesce(nullif(trim(member_role), ''), 'user'));
  end if;

  return updated_count;
end;
$$;
