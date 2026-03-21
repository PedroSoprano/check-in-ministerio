# Autenticação e usuários no Supabase

## Onde ver as tabelas no Supabase Dashboard

### 1. `auth.users` (usuários de autenticação)

**Não aparece no Table Editor.** Os usuários ficam em:

- **Authentication** → **Users** (menu lateral do Supabase)

Lá você vê todos que fizeram cadastro (email, última atividade etc.) e pode excluir usuários manualmente.

### 2. `public.profiles` (perfis da aplicação)

**Aparece no Table Editor:**

- **Table Editor** → **profiles**

Cada registro em `profiles` corresponde a um usuário em `auth.users` (mesmo `id`). É criado automaticamente no cadastro pelo trigger `handle_new_user`.

Colunas principais: `id`, `full_name`, `avatar_url`, `role` (`user` ou `admin`).

### 3. `public.members` (membros do ministério)

- **Table Editor** → **members**

Lista de pessoas que podem fazer check-in. O campo `user_id` indica se o membro tem conta vinculada. Se `user_id` = `id` de `profiles`, a pessoa tem login.

---

## Fluxo de login e cadastro

### Cadastro (`/signup`)

1. `supabase.auth.signUp()` cria o usuário em `auth.users`
2. Trigger `handle_new_user` cria um registro em `public.profiles` com o mesmo `id`
3. RPC `link_member_by_auth_email` vincula o `member` ao usuário quando o e-mail coincide
4. API `/api/ensure-profile` garante que o perfil exista (fallback se o trigger falhar)

### Login (`/login`)

1. `supabase.auth.signInWithPassword()` autentica contra `auth.users`
2. RPC `link_member_by_auth_email` tenta vincular membro pelo e-mail
3. Redireciona para `/me` ou `/hoje` (se admin)

---

## Excluir um usuário

### Opção 1: Pela aplicação (recomendado)

1. Acesse **Usuários com conta** no menu (admin)
2. Clique em **Excluir** no usuário desejado
3. O usuário será removido e o membro vinculado desativado (não aparecerá mais no check-in)

### Opção 2: Pelo Supabase Dashboard

1. **Authentication** → **Users** → selecione o usuário → **Delete user**
2. `profiles` é removido automaticamente (`ON DELETE CASCADE`)
3. `members.user_id` vira `null` (`ON DELETE SET NULL`)
4. O membro continua ativo e ainda aparece no check-in. Para impedir check-in, desative o membro manualmente em **Table Editor** → **members** → `active = false`

---

## Diferença: Members vs Users

| | **Members** | **Users (profiles)** |
|---|---|---|
| O que é | Lista de pessoas do ministério | Pessoas com login (e-mail/senha) |
| Check-in via QR | Sim, qualquer membro ativo pode | O check-in via QR é público, não exige login |
| Ver "Meus check-ins" | Precisa ter conta vinculada | Sim, precisa ter conta |
| Onde editar | Menu **Membros** | Menu **Usuários com conta** |
