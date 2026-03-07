"use client";

import { createClient } from "@/lib/supabase/client";
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
  const [sex, setSex] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("members")
        .select("name, email, matricula_senib, sex, active")
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
      setSex(data.sex ?? "");
      setActive(data.active ?? true);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("members")
      .update({
        name: name.trim(),
        email: email.trim() || null,
        matricula_senib: matriculaSenib.trim() || null,
        sex: sex || null,
        active,
      })
      .eq("id", id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/members");
    router.refresh();
  }

  if (loading) return <p className="text-gray-500">Carregando…</p>;
  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link href="/members" className="text-blue-600 hover:underline mt-2 inline-block">
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
            <option value="outro">Outro</option>
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
