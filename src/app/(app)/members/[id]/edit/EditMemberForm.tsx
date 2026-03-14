"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type MemberData = {
  id: string;
  name: string;
  email: string | null;
  matricula_senib: string | null;
  birth_date: string | null;
  sex: string | null;
  active: boolean;
  user_id: string | null;
  role_when_linked: string | null;
};

export type ProfileItem = { id: string; full_name: string | null; role: string };

export default function EditMemberForm({
  member,
  profiles,
  initialProfileRole,
}: {
  member: MemberData;
  profiles: ProfileItem[];
  initialProfileRole: "user" | "admin";
}) {
  const id = member.id;
  const router = useRouter();
  const [name, setName] = useState(member.name ?? "");
  const [email, setEmail] = useState(member.email ?? "");
  const [matriculaSenib, setMatriculaSenib] = useState(member.matricula_senib ?? "");
  const [birthDate, setBirthDate] = useState(member.birth_date ? String(member.birth_date).slice(0, 10) : "");
  const [sex, setSex] = useState(member.sex ?? "");
  const [active, setActive] = useState(member.active ?? true);
  const [saving, setSaving] = useState(false);
  const [profileRole, setProfileRole] = useState<"user" | "admin">(initialProfileRole);
  const [roleWhenLinked, setRoleWhenLinked] = useState<"user" | "admin">(
    member.role_when_linked === "admin" ? "admin" : "user"
  );
  const [linkedProfileId, setLinkedProfileId] = useState(member.user_id ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const memberPayload: Record<string, unknown> = {
      name: name.trim(),
      email: email.trim() || null,
      matricula_senib: matriculaSenib.trim() || null,
      birth_date: birthDate.trim() || null,
      sex: sex || null,
      active,
      user_id: linkedProfileId || null,
      role_when_linked: linkedProfileId ? profileRole : roleWhenLinked,
    };
    if (linkedProfileId) {
      const { error: unlinkErr } = await supabase
        .from("members")
        .update({ user_id: null })
        .eq("user_id", linkedProfileId)
        .neq("id", id);
      if (unlinkErr) {
        setSaving(false);
        toast.error(unlinkErr.message);
        return;
      }
    }
    const { error: err } = await supabase
      .from("members")
      .update(memberPayload)
      .eq("id", id);
    if (err) {
      setSaving(false);
      toast.error(err.message);
      return;
    }
    if (linkedProfileId) {
      const { error: roleErr } = await supabase
        .from("profiles")
        .update({ role: profileRole })
        .eq("id", linkedProfileId);
      if (roleErr) {
        setSaving(false);
        toast.error(roleErr.message);
        return;
      }
    }
    setSaving(false);
    toast.success("Membro atualizado.");
    router.push("/members");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Editar membro</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nome *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="matriculaSenib" className="block text-sm font-medium mb-1">
            Matrícula SENIB
          </label>
          <input
            id="matriculaSenib"
            type="text"
            value={matriculaSenib}
            onChange={(e) => setMatriculaSenib(e.target.value)}
            placeholder="Opcional"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium mb-1">
            Data de aniversário
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="sex" className="block text-sm font-medium mb-1">
            Sexo
          </label>
          <select
            id="sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">—</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="active" className="text-sm">
            Ativo
          </label>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <label htmlFor="linkProfile" className="block text-sm font-medium mb-1">
            Vincular conta (profile)
          </label>
          <select
            id="linkProfile"
            value={linkedProfileId}
            onChange={(e) => setLinkedProfileId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Nenhuma conta vinculada</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || "(sem nome)"} ({p.role === "admin" ? "admin" : "usuário"})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Vincule uma conta de usuário a este membro para que ele acesse o app com login.
          </p>
        </div>
        <div>
          <label htmlFor="profileRole" className="block text-sm font-medium mb-1">
            Função no sistema
          </label>
          {linkedProfileId ? (
            <>
              <select
                id="profileRole"
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value as "user" | "admin")}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Este membro tem conta vinculada. A função define o que ele pode acessar no app.
              </p>
            </>
          ) : (
            <>
              <select
                id="profileRole"
                aria-label="Função quando tiver conta vinculada"
                value={roleWhenLinked}
                onChange={(e) => setRoleWhenLinked(e.target.value as "user" | "admin")}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Quando o membro fizer login com o e-mail cadastrado acima, receberá esta função no app.
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
          <Link
            href="/members"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
