"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IconUser } from "@/components/Icons";
import { Loading } from "@/components/Loading";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function PerfilPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [matriculaSenib, setMatriculaSenib] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirect=/perfil");
        return;
      }
      const [memberRes, profileRes] = await Promise.all([
        supabase
          .from("members")
          .select("id, name, email, matricula_senib, birth_date, sex")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single(),
      ]);
      if (memberRes.error || !memberRes.data) {
        setError("Você não está vinculado a um membro. Entre em contato com o administrador.");
        setLoading(false);
        return;
      }
      const m = memberRes.data;
      setMemberId(m.id);
      setName(m.name ?? "");
      setEmail(m.email ?? "");
      setMatriculaSenib(m.matricula_senib ?? "");
      setBirthDate(m.birth_date ? String(m.birth_date).slice(0, 10) : "");
      setSex(m.sex ?? "");
      setRole(profileRes.data?.role ?? null);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("members")
      .update({
        name: name.trim(),
        email: email.trim() || null,
        matricula_senib: matriculaSenib.trim() || null,
        birth_date: birthDate || null,
        sex: sex || null,
      })
      .eq("id", memberId);
    setSaving(false);
    if (err) {
      toast.error(err.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    toast.success("Perfil atualizado com sucesso.");
    router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    setChangingPassword(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (err) {
      setPasswordMessage({ type: "error", text: err.message });
      return;
    }
    setPasswordMessage({ type: "success", text: "Senha alterada com sucesso." });
    setNewPassword("");
    setConfirmPassword("");
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <IconUser title="Perfil" />
          <h1 className="text-xl font-bold text-gray-900">Meu perfil</h1>
        </div>
        <Loading />
      </div>
    );
  }

  if (error && !memberId) {
    return (
      <div className="max-w-md space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[var(--brand-primary)]">
            <IconUser title="Perfil" />
          </span>
          <h1 className="text-xl font-bold text-gray-900">Meu perfil</h1>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-[var(--brand-primary)]">
          <IconUser title="Perfil" />
        </span>
        <h1 className="text-xl font-bold text-gray-900">Meu perfil</h1>
      </div>

      <p className="text-gray-600 text-sm">
        Atualize os dados do seu cadastro como membro. A função (Administrador/Usuário) não pode ser alterada por você.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Seu nome"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label htmlFor="matricula_senib" className={labelClass}>
            Matrícula
          </label>
          <input
            id="matricula_senib"
            type="text"
            value={matriculaSenib}
            onChange={(e) => setMatriculaSenib(e.target.value)}
            className={inputClass}
            placeholder="Ex.: matrícula SENIB"
          />
        </div>
        <div>
          <label htmlFor="birth_date" className={labelClass}>
            Data de nascimento
          </label>
          <input
            id="birth_date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sex" className={labelClass}>
            Sexo
          </label>
          <select
            id="sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        {role && (
          <div className="text-sm text-gray-500">
            Função:{" "}
            <span className="font-medium text-gray-700">
              {role === "admin" ? "Administrador" : "Usuário"}
            </span>
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>

      <section className="pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Alterar senha</h2>
        <p className="text-gray-600 text-sm mb-4">
          Digite a nova senha (mínimo 6 caracteres). Você permanecerá logado.
        </p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="new_password" className={labelClass}>
              Nova senha
            </label>
            <input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm_password" className={labelClass}>
              Confirmar nova senha
            </label>
            <input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Repita a senha"
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {passwordMessage && (
            <p
              className={`text-sm ${passwordMessage.type === "error" ? "text-red-600" : "text-green-600"}`}
            >
              {passwordMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {changingPassword ? "Alterando…" : "Alterar senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
