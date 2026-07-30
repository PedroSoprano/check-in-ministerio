-- ============================================
-- Musical Aladin - schema (módulo separado)
-- ============================================

create table public.productions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date,
  end_date date,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.musical_sessions (
  id uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.productions(id) on delete cascade,
  session_date date not null,
  session_time time,
  type text not null check (type in ('ensaio', 'apresentacao')),
  title text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index musical_sessions_production_date_idx
  on public.musical_sessions(production_id, session_date);

create table public.musical_scenes (
  id uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.productions(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table public.musical_pieces (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.musical_scenes(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table public.musical_participants (
  id uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.productions(id) on delete cascade,
  name text not null,
  member_id uuid references public.members(id) on delete set null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index musical_participants_production_idx
  on public.musical_participants(production_id);

create table public.cast_assignments (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid not null references public.musical_pieces(id) on delete cascade,
  participant_id uuid not null references public.musical_participants(id) on delete cascade,
  entrance_side text check (entrance_side is null or entrance_side in ('arvore', 'prateleira')),
  note text,
  created_at timestamptz default now(),
  unique (piece_id, participant_id)
);

create index cast_assignments_participant_idx on public.cast_assignments(participant_id);

create table public.musical_rsvps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.musical_sessions(id) on delete cascade,
  participant_id uuid not null references public.musical_participants(id) on delete cascade,
  status text not null check (status in ('confirmed', 'declined')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (session_id, participant_id)
);

create index musical_rsvps_session_idx on public.musical_rsvps(session_id);

-- updated_at triggers
create trigger productions_updated_at
  before update on public.productions
  for each row execute function public.update_updated_at();

create trigger musical_sessions_updated_at
  before update on public.musical_sessions
  for each row execute function public.update_updated_at();

create trigger musical_participants_updated_at
  before update on public.musical_participants
  for each row execute function public.update_updated_at();

create trigger musical_rsvps_updated_at
  before update on public.musical_rsvps
  for each row execute function public.update_updated_at();

-- ============================================
-- RLS
-- ============================================
alter table public.productions enable row level security;
alter table public.musical_sessions enable row level security;
alter table public.musical_scenes enable row level security;
alter table public.musical_pieces enable row level security;
alter table public.musical_participants enable row level security;
alter table public.cast_assignments enable row level security;
alter table public.musical_rsvps enable row level security;

-- Público: leitura
create policy "Anyone can view productions"
  on public.productions for select using (true);

create policy "Anyone can view musical sessions"
  on public.musical_sessions for select using (true);

create policy "Anyone can view musical scenes"
  on public.musical_scenes for select using (true);

create policy "Anyone can view musical pieces"
  on public.musical_pieces for select using (true);

create policy "Anyone can view musical participants"
  on public.musical_participants for select using (true);

create policy "Anyone can view cast assignments"
  on public.cast_assignments for select using (true);

create policy "Anyone can view musical rsvps"
  on public.musical_rsvps for select using (true);

-- Público: RSVP (fluxo tipo check-in por nome)
create policy "Anyone can insert musical rsvps"
  on public.musical_rsvps for insert with check (true);

create policy "Anyone can update musical rsvps"
  on public.musical_rsvps for update using (true);

create policy "Anyone can delete musical rsvps"
  on public.musical_rsvps for delete using (true);

-- Admin: gestão completa
create policy "Admins manage productions"
  on public.productions for all using (public.is_admin());

create policy "Admins manage musical sessions"
  on public.musical_sessions for all using (public.is_admin());

create policy "Admins manage musical scenes"
  on public.musical_scenes for all using (public.is_admin());

create policy "Admins manage musical pieces"
  on public.musical_pieces for all using (public.is_admin());

create policy "Admins manage musical participants"
  on public.musical_participants for all using (public.is_admin());

create policy "Admins manage cast assignments"
  on public.cast_assignments for all using (public.is_admin());

comment on table public.productions is 'Produções teatrais (ex.: Musical Aladin)';
comment on table public.musical_sessions is 'Ensaios e apresentações do musical';
comment on table public.musical_participants is 'Participantes do elenco (ajudantes + opcionalmente membros)';
comment on column public.cast_assignments.entrance_side is 'Lado de entrada no palco: arvore | prateleira';
comment on table public.musical_rsvps is 'Confirmação (confirmed) ou ausência (declined); sem linha = pendente';
