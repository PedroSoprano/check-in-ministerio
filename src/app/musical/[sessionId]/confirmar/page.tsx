"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";
import { Logo } from "@/components/Logo";
import { Loading } from "@/components/Loading";
import {
  clearRsvp,
  fetchActiveProduction,
  fetchSessionCast,
  fetchSessions,
  upsertRsvp,
} from "@/lib/musical/api";
import {
  formatAssignmentForPerson,
  formatSessionDate,
  sessionTypeLabel,
  type CastRow,
  type MusicalSession,
} from "@/lib/musical/types";

const CONFETTI_COLORS = [
  "#0d9488",
  "#0f766e",
  "#e11d48",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#22c55e",
  "#ec4899",
];

function fireConfetti() {
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: CONFETTI_COLORS });
  confetti({
    particleCount: 50,
    spread: 100,
    origin: { x: 0.2, y: 0.7 },
    colors: CONFETTI_COLORS,
  });
  confetti({
    particleCount: 50,
    spread: 100,
    origin: { x: 0.8, y: 0.7 },
    colors: CONFETTI_COLORS,
  });
}

export default function MusicalConfirmarPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MusicalSession | null>(null);
  const [productionId, setProductionId] = useState<string | null>(null);
  const [rows, setRows] = useState<CastRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const participants = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.participantId, r.participantName);
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [rows]);

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(nameInput.trim().toLowerCase())
  );

  const myAssignments = useMemo(() => {
    if (!selectedId) return [];
    return rows
      .filter((r) => r.participantId === selectedId)
      .map((r) => formatAssignmentForPerson(r));
  }, [rows, selectedId]);

  useEffect(() => {
    async function load() {
      try {
        const production = await fetchActiveProduction();
        if (!production) {
          setLoading(false);
          return;
        }
        setProductionId(production.id);
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

  async function setMyStatus(status: "confirmed" | "declined" | null) {
    if (!selectedId || !productionId) {
      toast.error("Selecione seu nome na lista.");
      return;
    }
    setSubmitting(true);
    try {
      if (status === null) await clearRsvp(sessionId, selectedId);
      else await upsertRsvp(sessionId, selectedId, status);
      if (status === "confirmed") {
        toast.success("Presença confirmada! Obrigado 🎉");
        fireConfetti();
        setTimeout(() => router.push(`/musical/${sessionId}`), 900);
      } else if (status === "declined") {
        toast.success("Ausência registrada. Obrigado por avisar.");
        router.push(`/musical/${sessionId}`);
      } else {
        toast.success("Resposta removida.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  }

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
      <div className="mx-auto w-full max-w-lg px-5 pt-5 pb-10">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Logo width={110} height={40} />
        <Link
          href={`/musical/${sessionId}`}
          className="text-sm text-[var(--brand-primary)] hover:underline"
        >
          Ver lista
        </Link>
      </div>

      <div className="mb-6">
        <span className="text-xs font-medium uppercase text-[var(--brand-primary)]">
          {sessionTypeLabel(session.type)}
        </span>
        <h1 className="text-xl font-bold text-gray-900">Confirmar presença</h1>
        <p className="text-sm text-gray-600 capitalize">
          {session.title} · {formatSessionDate(session.session_date)}
          {session.session_time ? ` · ${String(session.session_time).slice(0, 5)}` : ""}
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <p className="text-sm text-gray-600">
          Digite e selecione seu nome. Depois diga se <strong>vai</strong> ou{" "}
          <strong>não vai</strong> a este ensaio/apresentação.
        </p>
        <div className="relative">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Seu nome
          </label>
          <input
            id="name"
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setSelectedId("");
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            placeholder="Digite seu nome…"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] text-base"
            autoComplete="off"
          />
          {dropdownOpen && (
            <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500">Nenhum nome encontrado</li>
              ) : (
                filtered.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-3 cursor-pointer hover:bg-[var(--brand-muted)]"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSelectedId(p.id);
                      setNameInput(p.name);
                      setDropdownOpen(false);
                    }}
                  >
                    {p.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {myAssignments.length > 0 && (
          <div className="rounded-lg bg-[var(--brand-muted)]/50 p-3 text-sm text-gray-800 space-y-3">
            <p className="font-medium">
              Onde você atua
              {myAssignments.length > 1
                ? ` (${myAssignments.length} cenas — uma confirmação vale para todas):`
                : ":"}
            </p>
            {myAssignments.map((a, i) => (
              <div
                key={`${a.scene}-${a.piece}-${a.entrance}-${i}`}
                className="rounded-lg border border-teal-100 bg-white/80 px-3 py-2 space-y-1"
              >
                <p>
                  <span className="text-gray-500">Seção:</span>{" "}
                  <strong>{a.scene}</strong>
                </p>
                {a.entrance && (
                  <p>
                    <span className="text-gray-500">Entra por:</span>{" "}
                    <strong>{a.entrance}</strong>
                  </p>
                )}
                {a.piece !== a.scene && (
                  <p>
                    <span className="text-gray-500">Peça:</span>{" "}
                    <strong>{a.piece}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={submitting || !selectedId}
            onClick={() => setMyStatus("confirmed")}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[var(--brand-primary)] text-white text-base font-medium disabled:opacity-50"
          >
            Vou (confirmar)
          </button>
          <button
            type="button"
            disabled={submitting || !selectedId}
            onClick={() => setMyStatus("declined")}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-red-600 text-white text-base font-medium disabled:opacity-50"
          >
            Não vou
          </button>
          <button
            type="button"
            disabled={submitting || !selectedId}
            onClick={() => setMyStatus(null)}
            className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm disabled:opacity-50"
          >
            Limpar resposta
          </button>
        </div>
      </section>

      <p className="mt-4 text-center text-sm">
        <Link href="/musical" className="text-gray-500 hover:underline">
          Voltar ao calendário
        </Link>
      </p>
      </div>
    </main>
  );
}
