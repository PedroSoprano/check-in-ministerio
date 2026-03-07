-- ============================================
-- RLS (Row Level Security) e Triggers
-- ============================================

-- Habilitar RLS em todas as tabelas
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.check_ins enable row level security;

-- ============================================
-- PROFILES
-- ============================================
-- Usuário vê e edita apenas seu próprio perfil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins podem ver todos os perfis
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- MEMBERS
-- ============================================
-- Check-in PÚBLICO: qualquer um pode listar membros (para seleção no QR)
create policy "Anyone can list active members"
  on public.members for select
  using (active = true);

-- Apenas admins podem inserir, atualizar e deletar membros
create policy "Admins can manage members"
  on public.members for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- EVENTS
-- ============================================
-- Qualquer um autenticado pode ver eventos (calendário)
create policy "Authenticated users can view events"
  on public.events for select
  to authenticated
  using (true);

-- Apenas admins podem gerenciar eventos
create policy "Admins can manage events"
  on public.events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- CHECK_INS
-- ============================================
-- Check-in PÚBLICO: qualquer um pode inserir (sem login - QR Code)
create policy "Anyone can create check-in"
  on public.check_ins for insert
  with check (true);

-- Usuários autenticados podem ver check-ins do próprio membro (quando linked)
create policy "Users can view own check-ins"
  on public.check_ins for select
  using (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

-- Admins podem ver e gerenciar todos os check-ins
create policy "Admins can manage all check-ins"
  on public.check_ins for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- TRIGGER: Criar profile automaticamente no signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- TRIGGER: Atualizar updated_at
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger members_updated_at
  before update on public.members
  for each row execute function public.update_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.update_updated_at();
