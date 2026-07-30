"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { Logo } from "@/components/Logo";
import { Loading } from "@/components/Loading";
import { MusicalSectionBoard } from "@/components/musical/MusicalSectionBoard";
import {
  fetchActiveProduction,
  fetchSessionCast,
  fetchSessions,
} from "@/lib/musical/api";
import {
  formatSessionDate,
  sessionTypeLabel,
  type CastRow,
  type MusicalSession,
} from "@/lib/musical/types";

export default function MusicalSessionListPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MusicalSession | null>(null);
  const [rows, setRows] = useState<CastRow[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const production = await fetchActiveProduction();
        if (!production) {
          setLoading(false);
          return;
        }
        const sessions = await fetchSessions(production.id);
        const found = sessions.find((s) => s.id === sessionId) as MusicalSession | undefined;
        setSession(found ?? null);
        if (found) {
          setRows(await fetchSessionCast(sessionId, production.id));
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao carregar.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading) return <Loading fullPage />;
  if (!session) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto">
        <p className="text-red-600">Sessão não encontrada.</p>
        <Link href="/musical" className="text-[var(--brand-primary)] hover:underline mt-2 inline-block">
          Voltar ao calendário
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[var(--brand-muted)] to-white safe-area-padding">
      <div className="mx-auto w-full max-w-2xl px-5 pt-5 pb-10">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Logo width={110} height={40} />
        <Link href="/musical" className="text-sm text-[var(--brand-primary)] hover:underline">
          Calendário
        </Link>
      </div>

      <div className="mb-4">
        <span className="text-xs font-medium uppercase text-[var(--brand-primary)]">
          {sessionTypeLabel(session.type)}
        </span>
        <h1 className="text-xl font-bold text-gray-900">Lista de presença</h1>
        <p className="text-sm text-gray-600 capitalize">
          {session.title} · {formatSessionDate(session.session_date)}
          {session.session_time ? ` · ${String(session.session_time).slice(0, 5)}` : ""}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Verde = confirmou · sem cor = pendente · vermelho = não vai
        </p>
      </div>

      <div className="mb-6">
        <Link
          href={`/musical/${sessionId}/confirmar`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)]"
        >
          Confirmar se eu vou
        </Link>
      </div>

      <MusicalSectionBoard rows={rows} />
      </div>
    </main>
  );
}
