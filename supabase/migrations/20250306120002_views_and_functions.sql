-- ============================================
-- Views e Funções para o Dashboard
-- Apenas admins podem acessar (security definer + check)
-- ============================================

-- ============================================
-- FUNÇÃO: Membros ausentes há mais de 2 semanas
-- Para o alerta do Dashboard
-- ============================================
create or replace function public.get_members_absent_two_weeks()
returns table (
  id uuid,
  name text,
  email text,
  last_check_in_at timestamptz,
  days_absent bigint
) as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    return;
  end if;

  return query
  select
    m.id,
    m.name,
    m.email,
    max(c.created_at) as last_check_in_at,
    (current_date - max(c.created_at)::date)::bigint as days_absent
  from public.members m
  left join public.check_ins c on c.member_id = m.id
  where m.active = true
  group by m.id, m.name, m.email
  having max(c.created_at) is null
     or max(c.created_at) < (current_timestamp - interval '2 weeks')
  order by last_check_in_at nulls first;
end;
$$ language plpgsql security definer;

grant execute on function public.get_members_absent_two_weeks() to authenticated;

-- ============================================
-- FUNÇÃO: Ranking de engajamento (versículos + meditações)
-- Para premiações/incentivos
-- ============================================
create or replace function public.get_engagement_ranking()
returns table (
  id uuid,
  name text,
  total_check_ins bigint,
  total_verses bigint,
  total_meditations bigint
) as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    return;
  end if;

  return query
  select
    m.id,
    m.name,
    count(c.id) as total_check_ins,
    coalesce(sum(c.verses_memorized), 0)::bigint as total_verses,
    sum(case when c.meditation_done then 1 else 0 end)::bigint as total_meditations
  from public.members m
  left join public.check_ins c on c.member_id = m.id
    and c.created_at >= date_trunc('month', current_date)
  where m.active = true
  group by m.id, m.name
  order by total_verses desc, total_meditations desc;
end;
$$ language plpgsql security definer;

grant execute on function public.get_engagement_ranking() to authenticated;

-- ============================================
-- FUNÇÃO: Estatísticas do mês (presença, etc.)
-- ============================================
create or replace function public.get_monthly_stats(p_date date default current_date)
returns table (
  total_members bigint,
  members_with_checkin bigint,
  presence_percentage numeric,
  total_verses bigint,
  total_meditations bigint
) as $$
begin
  -- Apenas admins podem ver estatísticas gerais
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    return;
  end if;

  return query
  with month_start as (
    select date_trunc('month', p_date)::date as start_date
  ),
  month_end as (
    select (date_trunc('month', p_date) + interval '1 month' - interval '1 day')::date as end_date
  ),
  active_members as (
    select count(*) as cnt from public.members where active = true
  ),
  checked_in as (
    select count(distinct member_id) as cnt
    from public.check_ins c, month_start ms, month_end me
    where c.created_at::date >= ms.start_date
      and c.created_at::date <= me.end_date
  )
  select
    am.cnt,
    coalesce(ci.cnt, 0),
    case when am.cnt > 0 then round(100.0 * coalesce(ci.cnt, 0) / am.cnt, 2) else 0 end,
    (select coalesce(sum(verses_memorized), 0) from public.check_ins c, month_start ms, month_end me
     where c.created_at::date >= ms.start_date and c.created_at::date <= me.end_date),
    (select coalesce(sum(case when meditation_done then 1 else 0 end), 0)
     from public.check_ins c, month_start ms, month_end me
     where c.created_at::date >= ms.start_date and c.created_at::date <= me.end_date)
  from active_members am
  cross join checked_in ci;
end;
$$ language plpgsql security definer;

-- Conceder execução para authenticated (apenas admins recebem dados)
grant execute on function public.get_monthly_stats(date) to authenticated;
