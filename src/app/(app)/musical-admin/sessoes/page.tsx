"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/client";
import { Loading } from "@/components/Loading";
import { fetchActiveProduction } from "@/lib/musical/api";
import {
  formatSessionDate,
  sessionTypeLabel,
  type MusicalSession,
} from "@/lib/musical/types";

export default function MusicalSessoesPage() {
  const [loading, setLoading] = useState(true);
  const [productionId, setProductionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<MusicalSession[]>([]);
  const [title, setTitle] = useState("Ensaio Musical Aladin");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("14:30");
  const [type, setType] = useState<"ensaio" | "apresentacao">("ensaio");
  const [saving, setSaving] = useState(false);

  async function reload(prodId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("musical_sessions")
      .select("id, production_id, session_date, session_time, type, title, description")
      .eq("production_id", prodId)
      .order("session_date")
      .order("session_time");
    if (error) throw error;
    setSessions((data ?? []) as MusicalSession[]);
  }

  useEffect(() => {
    async function load() {
      try {
        const production = await fetchActiveProduction();
        if (!production) {
          toast.error("Nenhuma produção ativa.");
          setLoading(false);
          return;
        }
        setProductionId(production.id);
        await reload(production.id);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao carregar.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!productionId || !sessionDate) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("musical_sessions").insert({
      production_id: productionId,
      title: title.trim(),
      session_date: sessionDate,
      session_time: sessionTime || null,
      type,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sessão criada.");
    await reload(productionId);
  }

  async function handleDelete(id: string) {
    if (!productionId) return;
    if (!confirm("Excluir esta sessão e os RSVPs dela?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("musical_sessions").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await reload(productionId);
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sessões do musical</h1>
          <p className="text-sm text-gray-600">
            Crie ensaios e apresentações. As datas de agosto (14–23) são apresentações; use este
            formulário para cadastrar ensaios (ex.: amanhã).
          </p>
        </div>
        <Link href="/musical-admin" className="text-sm text-[var(--brand-primary)] hover:underline">
          Voltar
        </Link>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 max-w-md rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">Nova sessão</h2>
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "ensaio" | "apresentacao")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="ensaio">Ensaio</option>
            <option value="apresentacao">Apresentação</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Data</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Horário</label>
          <input
            type="time"
            value={sessionTime}
            onChange={(e) => setSessionTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Criar sessão"}
        </button>
      </form>

      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {sessions.map((s) => (
          <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase text-[var(--brand-primary)]">
                {sessionTypeLabel(s.type)}
              </div>
              <div className="font-medium text-gray-900">{s.title}</div>
              <div className="text-sm text-gray-600 capitalize">
                {formatSessionDate(s.session_date)}
                {s.session_time ? ` · ${String(s.session_time).slice(0, 5)}` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(s.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Excluir
            </button>
          </li>
        ))}
        {sessions.length === 0 && (
          <li className="px-4 py-4 text-sm text-gray-500">Nenhuma sessão.</li>
        )}
      </ul>
    </div>
  );
}
