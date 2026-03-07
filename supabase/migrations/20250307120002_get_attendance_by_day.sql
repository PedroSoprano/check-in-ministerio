-- ============================================
-- Presença por dia (apenas dias com evento)
-- Para gráfico de barras no dashboard admin
-- ============================================
create or replace function public.get_attendance_by_day(
  p_start date default (current_date - interval '3 months')::date,
  p_end date default current_date
)
returns table (
  day date,
  total_check_ins bigint,
  by_sex jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    return;
  end if;

  return query
  with days_with_events as (
    select distinct e.event_date as d
    from public.events e
    where e.event_date >= p_start and e.event_date <= p_end
  ),
  daily_total as (
    select
      c.created_at::date as day,
      count(c.id)::bigint as total_check_ins
    from public.check_ins c
    join days_with_events dwe on dwe.d = c.created_at::date
    where c.created_at::date >= p_start and c.created_at::date <= p_end
    group by c.created_at::date
  ),
  by_sex_per_day as (
    select
      sub.day,
      jsonb_object_agg(sub.sex, sub.cnt) as by_sex
    from (
      select
        c.created_at::date as day,
        coalesce(m.sex, 'outro') as sex,
        count(*)::bigint as cnt
      from public.check_ins c
      join public.members m on m.id = c.member_id
      join days_with_events dwe on dwe.d = c.created_at::date
      where c.created_at::date >= p_start and c.created_at::date <= p_end
      group by c.created_at::date, coalesce(m.sex, 'outro')
    ) sub
    group by sub.day
  )
  select
    d.day,
    d.total_check_ins,
    coalesce(b.by_sex, '{}'::jsonb)
  from daily_total d
  left join by_sex_per_day b on b.day = d.day
  order by d.day;
end;
$$;

grant execute on function public.get_attendance_by_day(date, date) to authenticated;

comment on function public.get_attendance_by_day(date, date) is 'Retorna presença por dia apenas para dias que tiveram evento; inclui total e breakdown por sex (admin).';
