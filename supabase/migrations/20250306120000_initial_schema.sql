-- ============================================
-- Check-in Ministério - Schema Inicial
-- ============================================

-- Extensão UUID (já vem habilitada no Supabase)
-- create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (estende auth.users)
-- Perfis de usuários logados (User e Admin)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 2. MEMBERS (membros do ministério)
-- Lista de pessoas que podem fazer check-in
-- user_id nullable: membro pode existir sem conta (check-in público)
-- ============================================
create table public.members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  matricula_senib text unique,
  birth_date date,
  user_id uuid references auth.users on delete set null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 3. EVENTS (calendário - ensaios e eventos)
-- ============================================
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  event_date date not null,
  event_time time,
  type text not null check (type in ('ensaio', 'evento')),
  description text,
  recurrence_rule text, -- ex: "weekly" para ensaios recorrentes
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 4. CHECK_INS (registros de presença)
-- ============================================
create table public.check_ins (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.members on delete cascade not null,
  event_id uuid references public.events on delete set null,
  meditation_done boolean default false,
  verses_memorized integer default 0 check (verses_memorized >= 0),
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_at timestamptz default now()
);

-- ============================================
-- ÍNDICES para performance
-- ============================================
create index check_ins_member_id_idx on public.check_ins(member_id);
create index check_ins_event_id_idx on public.check_ins(event_id);
create index check_ins_created_at_idx on public.check_ins(created_at);
create index members_user_id_idx on public.members(user_id);
create index events_event_date_idx on public.events(event_date);

-- ============================================
-- COMENTÁRIOS nas tabelas
-- ============================================
comment on table public.profiles is 'Perfis de usuários autenticados (User/Admin)';
comment on table public.members is 'Membros do ministério - lista para check-in';
comment on table public.events is 'Ensaios regulares e eventos extraordinários';
comment on table public.check_ins is 'Registros de presença e engajamento';
