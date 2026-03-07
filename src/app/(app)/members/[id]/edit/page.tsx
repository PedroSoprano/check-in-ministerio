"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Loading } from "@/components/Loading";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditMemberPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [matriculaSenib, setMatriculaSenib] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<"user" | "admin">("user");
  const [roleWhenLinked, setRoleWhenLinked] = useState<"user" | "admin">("user");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("members")
        .select("name, email, matricula_senib, birth_date, sex, active, user_id, role_when_linked")
        .eq("id", id)
        .single();
      if (err || !data) {
        setError("Membro não encontrado.");
        setLoading(false);
        return;
      }
      setName(data.name ?? "");
      setEmail(data.email ?? "");
      setMatriculaSenib(data.matricula_senib ?? "");
      setBirthDate(data.birth_date ? String(data.birth_date).slice(0, 10) : "");
      setSex(data.sex ?? "");
      setActive(data.active ?? true);
      setUserId(data.user_id ?? null);
      const roleVal = data.role_when_linked === "admin" ? "admin" : "user";
      setRoleWhenLinked(roleVal);
      if (data.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user_id)
          .single();
        setProfileRole((profile?.role === "admin" ? "admin" : "user"));
      } else {
        setProfileRole(roleVal);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const memberPayload: Record<string, unknown> = {
      name: name.trim(),
      email: email.trim() || null,
      matricula_senib: matriculaSenib.trim() || null,
      birth_date: birthDate.trim() || null,
      sex: sex || null,
      active,
    };
    if (userId) {
      memberPayload.role_when_linked = profileRole;
    } else {
      memberPayload.role_when_linked = roleWhenLinked;
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
    if (userId) {
      const { error: roleErr } = await supabase
        .from("profiles")
        .update({ role: profileRole })
        .eq("id", userId);
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

  if (loading) return <Loading />;
  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link href="/members" className="text-[var(--brand-primary)] hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
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
        <div>
          <label htmlFor="profileRole" className="block text-sm font-medium mb-1">
            Função no sistema
          </label>
          {userId ? (
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
