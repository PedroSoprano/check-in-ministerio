# Database Schema - Check-in Ministério

## Diagrama das Tabelas

```
auth.users (Supabase)
    │
    ├── profiles (id, full_name, avatar_url, role)
    │
    └── members (user_id) ──┐
                            │
events ─────────────────────┼── check_ins (member_id, event_id, meditation_done, verses_memorized, lat/lng)
                            │
members (id, name, email) ───┘
```

## Tabelas

### `profiles`
Extende `auth.users`. Criado automaticamente no signup via trigger.

| Coluna      | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id          | uuid   | PK, FK → auth.users          |
| full_name   | text   | Nome completo                |
| avatar_url  | text   | URL da foto (login social)   |
| role        | text   | `user` ou `admin`             |
| created_at  | timestamptz | |
| updated_at  | timestamptz | |

### `members`
Membros do ministério. Lista usada no check-in via QR Code.

| Coluna      | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| id             | uuid   | PK                           |
| name           | text   | Nome (obrigatório)           |
| email          | text   | Opcional                     |
| matricula_senib| text   | Matrícula SENIB (única, opcional) |
| birth_date     | date   | Data de aniversário (opcional)|
| user_id        | uuid   | FK → auth.users (nullable)   |
| active      | boolean| Ativo no ministério          |
| created_at  | timestamptz | |
| updated_at  | timestamptz | |

### `events`
Ensaios regulares e eventos extraordinários.

| Coluna        | Tipo   | Descrição                    |
|---------------|--------|------------------------------|
| id            | uuid   | PK                           |
| title         | text   | Título do evento              |
| event_date    | date   | Data                         |
| event_time    | time   | Horário                      |
| type          | text   | `regular` ou `extraordinary`  |
| description   | text   | Descrição opcional           |
| recurrence_rule | text | Ex: "weekly"                 |
| created_at    | timestamptz | |
| updated_at    | timestamptz | |

### `check_ins`
Registros de presença e engajamento.

| Coluna          | Tipo   | Descrição                    |
|-----------------|--------|------------------------------|
| id              | uuid   | PK                           |
| member_id       | uuid   | FK → members                 |
| event_id        | uuid   | FK → events (nullable)       |
| meditation_done | boolean| Fez meditação da semana?      |
| verses_memorized| integer| Versículos decorados         |
| latitude        | decimal| Geolocalização (opcional)    |
| longitude       | decimal| Geolocalização (opcional)    |
| created_at      | timestamptz | |

## Funções do Dashboard (apenas admins)

### `get_members_absent_two_weeks()`
Retorna membros sem check-in há mais de 2 semanas (alertas).

### `get_engagement_ranking()`
Ranking do mês: total de versículos e meditações por membro.

### `get_monthly_stats(p_date)`
Retorna: total de membros, quem fez check-in, % presença, versículos e meditações do mês.
**Apenas admins** podem chamar.

## Como aplicar

### Opção 1: Supabase Dashboard (SQL Editor)
Copie o conteúdo de cada arquivo em `supabase/migrations/` e execute na ordem:
1. `20250306120000_initial_schema.sql`
2. `20250306120001_rls_and_triggers.sql`
3. `20250306120002_views_and_functions.sql`

### Opção 2: Supabase CLI
```bash
supabase link  # vincular ao projeto
supabase db push  # aplicar migrations
```

### Primeiro Admin
Após o primeiro usuário se cadastrar, promova-o a admin manualmente:
```sql
update public.profiles set role = 'admin' where id = 'UUID_DO_USUARIO';
```
