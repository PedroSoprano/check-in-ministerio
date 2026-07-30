"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loading } from "@/components/Loading";
import { MusicalSectionBoard } from "@/components/musical/MusicalSectionBoard";
import {
  clearRsvp,
  fetchActiveProduction,
  fetchSessionCast,
  fetchSessions,
  upsertRsvp,
} from "@/lib/musical/api";
import {
  formatSessionDate,
  sessionTypeLabel,
  type CastRow,
  type MusicalSession,
} from "@/lib/musical/types";

export default function MusicalAdminPage() {
  const [loading, setLoading] = useState(true);
  const [productionId, setProductionId] = useState<string | null>(null);
  const [productionTitle, setProductionTitle] = useState("Musical");
  const [sessions, setSessions] = useState<MusicalSession[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [rows, setRows] = useState<CastRow[]>([]);

  async function loadCast(prodId: string, sid: string) {
    if (!sid) {
      setRows([]);
      return;
    }
    const cast = await fetchSessionCast(sid, prodId);
    setRows(cast);
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
        setProductionTitle(production.title);
        const list = (await fetchSessions(production.id)) as MusicalSession[];
        setSessions(list);
        const first = list[0]?.id ?? "";
        setSessionId(first);
        if (first) await loadCast(production.id, first);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao carregar.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onToggle(participantId: string, next: "confirmed" | "declined" | null) {
    if (!productionId || !sessionId) return;
    try {
      if (next === null) await clearRsvp(sessionId, participantId);
      else await upsertRsvp(sessionId, participantId, next);
      await loadCast(productionId, sessionId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar.");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{productionTitle}</h1>
          <p className="text-sm text-gray-600">
            Presença por seção (cena + lado de entrada). Verde = confirmado, vermelho = ausente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/musical-admin/elenco"
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Elenco
          </Link>
          <Link
            href="/musical-admin/sessoes"
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Sessões
          </Link>
          <Link
            href="/musical"
            className="px-3 py-2 text-sm rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]"
          >
            Ver público
          </Link>
        </div>
      </div>

      <div>
        <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
          Sessão
        </label>
        <select
          id="session"
          value={sessionId}
          onChange={async (e) => {
            const id = e.target.value;
            setSessionId(id);
            if (productionId) await loadCast(productionId, id);
          }}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)]"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {formatSessionDate(s.session_date)} · {sessionTypeLabel(s.type)} · {s.title}
            </option>
          ))}
        </select>
      </div>

      {sessionId ? (
        <MusicalSectionBoard rows={rows} allowToggle onToggle={onToggle} />
      ) : (
        <p className="text-sm text-gray-500">Cadastre sessões em Sessões.</p>
      )}
    </div>
  );
}
