# Check-in Ministério de Fantoches

Aplicação de check-in e programação para o ministério, com Next.js 15 e Supabase.

## Funcionalidades

- **Público:** check-in de presença (sem login), calendário mensal com eventos
- **Membro:** área "Meus check-ins" (após vincular conta ao cadastro)
- **Admin:** dashboard com gráficos (presença por dia, estatísticas por sexo), CRUD de membros e eventos

## Pré-requisitos

- Node.js 18+
- Conta Supabase e projeto criado

## Configuração

1. Clone o repositório e instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de exemplo de variáveis de ambiente:

   ```bash
   cp .env.local.example .env.local
   ```

3. Preencha `.env.local` com os valores do seu projeto Supabase:

   - `NEXT_PUBLIC_SUPABASE_URL` – URL do projeto (ex.: https://xxx.supabase.co)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – chave anon (pública)
   - `SUPABASE_SERVICE_ROLE_KEY` – chave service role (apenas servidor; não exponha no cliente)

4. Aplique as migrations no Supabase (remoto ou local):

   ```bash
   npx supabase db push
   ```

   Para rodar o seed no banco remoto, execute o conteúdo de `supabase/seed.sql` no SQL Editor do Dashboard.

5. (Opcional) Rodar Supabase local:

   ```bash
   npx supabase start
   npx supabase db reset
   ```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Primeiro admin

Após o primeiro cadastro, defina um usuário como admin no Supabase:

- **Dashboard** → Table Editor → `profiles` → edite o registro e defina `role` = `admin`

Ou execute no SQL Editor:

```sql
update public.profiles set role = 'admin' where id = 'uuid-do-usuario';
```

## Estrutura

- `src/app` – rotas (check-in, calendário, login, dashboard, membros, eventos, me)
- `src/lib/supabase` – cliente browser, servidor, middleware e admin (service role)
- `supabase/migrations` – schema e funções (RLS, RPCs)
