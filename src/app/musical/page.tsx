"use client";

import Link from "next/link";
import { Loading } from "@/components/Loading";
import { Logo } from "@/components/Logo";
import { fetchActiveProduction, fetchSessions } from "@/lib/musical/api";
import {
  sessionTypeLabel,
  type MusicalSession,
} from "@/lib/musical/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatTime(t: string | null) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

function formatDateDisplay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MusicalCalendarPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [sessions, setSessions] = useState<MusicalSession[]>([]);
  const [title, setTitle] = useState("Musical Aladin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("calendario");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const production = await fetchActiveProduction();
      if (!production) {
        setError("Nenhuma produção ativa no momento.");
        setSessions([]);
        return;
      }
      setTitle(production.title);
      const list = (await fetchSessions(production.id)) as MusicalSession[];
      setSessions(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sessionsByDate = useMemo(() => {
    const map: Record<string, MusicalSession[]> = {};
    for (const s of sessions) {
      const d = String(s.session_date).slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(s);
    }
    return map;
  }, [sessions]);

  const monthSessions = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return sessions.filter((s) => String(s.session_date).startsWith(prefix));
  }, [sessions, year, month]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const todayStr = getTodayStr();

  const cells: { day: number | null; dateStr: string | null }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < startWeekday || i - startWeekday + 1 > daysInMonth) {
      cells.push({ day: null, dateStr: null });
    } else {
      const day = i - startWeekday + 1;
      cells.push({
        day,
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      });
    }
  }

  const modalSessions = modalDate ? sessionsByDate[modalDate] ?? [] : [];

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[var(--brand-muted)] to-white safe-area-padding">
      <div className="mx-auto w-full max-w-4xl px-5 pt-5 pb-6 sm:p-6">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Logo width={120} height={42} className="mb-2" />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{title}</h1>
          <p className="text-sm text-gray-600">Programação de ensaios e apresentações</p>
        </div>
        <Link
          href="/"
          className="min-h-[44px] flex items-center text-sm font-medium text-[var(--brand-primary)] hover:underline py-2 shrink-0"
        >
          Início
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] text-sm font-medium"
        >
          ← Anterior
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-center text-gray-800">
          {MONTHS[month - 1]} {year}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] text-sm font-medium"
        >
          Próximo →
        </button>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-white/80 rounded-xl border border-gray-200 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setViewMode("calendario")}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium ${
            viewMode === "calendario"
              ? "bg-[var(--brand-primary)] text-white shadow-sm"
              : "text-gray-600"
          }`}
        >
          Calendário
        </button>
        <button
          type="button"
          onClick={() => setViewMode("lista")}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium ${
            viewMode === "lista"
              ? "bg-[var(--brand-primary)] text-white shadow-sm"
              : "text-gray-600"
          }`}
        >
          Lista
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : viewMode === "lista" ? (
        <ul className="space-y-2 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {monthSessions.length === 0 ? (
            <li className="p-4 text-gray-500 text-sm">
              Nenhuma sessão em {MONTHS[month - 1]} {year}.
            </li>
          ) : (
            monthSessions.map((s) => {
              const dateStr = String(s.session_date).slice(0, 10);
              const [, m, d] = dateStr.split("-");
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between min-h-[52px] p-4 border-b border-gray-100 last:border-0 hover:bg-[var(--brand-muted)] cursor-pointer"
                  onClick={() => setModalDate(dateStr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && setModalDate(dateStr)
                  }
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-sm font-medium text-gray-500 w-14 shrink-0">
                      {d}/{m}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{s.title}</p>
                      <p className="text-sm text-gray-600">
                        {s.session_time ? formatTime(s.session_time) : "Horário a definir"} ·{" "}
                        {sessionTypeLabel(s.type)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[var(--brand-primary)] shrink-0">
                    Ver
                  </span>
                </li>
              );
            })
          )}
        </ul>
      ) : (
        <div className="border border-gray-200 rounded overflow-hidden bg-white">
          <div className="grid grid-cols-7 bg-gray-100">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="p-2 text-center text-xs font-medium text-gray-600 border-b border-r border-gray-200 last:border-r-0"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map(({ day, dateStr }, i) => {
              const daySessions = dateStr ? sessionsByDate[dateStr] ?? [] : [];
              const has = daySessions.length > 0;
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={i}
                  className={`min-h-[64px] sm:min-h-[80px] p-1.5 sm:p-2 border-b border-r border-gray-200 last:border-r-0 ${
                    has ? "bg-[var(--brand-muted)] hover:bg-teal-100" : "bg-white"
                  } ${isToday ? "ring-2 ring-inset ring-[var(--brand-primary)]" : ""} ${
                    dateStr ? "cursor-pointer" : ""
                  }`}
                  role={dateStr ? "button" : undefined}
                  tabIndex={dateStr ? 0 : undefined}
                  onClick={() => dateStr && setModalDate(dateStr)}
                  onKeyDown={(e) =>
                    dateStr &&
                    (e.key === "Enter" || e.key === " ") &&
                    setModalDate(dateStr)
                  }
                >
                  {day !== null && dateStr && (
                    <>
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? "flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white"
                            : has
                              ? "text-[var(--brand-primary-active)]"
                              : "text-gray-700"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {daySessions.map((s) => (
                          <div
                            key={s.id}
                            className={`text-[10px] sm:text-xs truncate px-1 py-0.5 rounded ${
                              s.type === "apresentacao"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-teal-100 text-[var(--brand-primary-active)]"
                            }`}
                            title={`${s.title} — ${sessionTypeLabel(s.type)}`}
                          >
                            {s.session_time
                              ? formatTime(s.session_time)
                              : sessionTypeLabel(s.type)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-1" /> Ensaio{" "}
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 ml-3 mr-1" />{" "}
        Apresentação
      </p>

      {modalDate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
          onClick={() => setModalDate(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full max-w-md max-h-[90dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDateDisplay(modalDate)}
              </h2>
              <button
                type="button"
                onClick={() => setModalDate(null)}
                className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              {modalSessions.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma sessão neste dia.</p>
              ) : (
                modalSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-3"
                  >
                    <div>
                      <p className="text-xs uppercase font-medium text-[var(--brand-primary)]">
                        {sessionTypeLabel(s.type)}
                      </p>
                      <p className="font-medium text-gray-900">{s.title}</p>
                      <p className="text-sm text-gray-600">
                        {s.session_time
                          ? formatTime(s.session_time)
                          : "Horário a definir"}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/musical/${s.id}/confirmar`}
                        className="min-h-[44px] flex-1 inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)]"
                      >
                        Confirmar se vou
                      </Link>
                      <Link
                        href={`/musical/${s.id}`}
                        className="min-h-[44px] flex-1 inline-flex items-center justify-center rounded-lg border-2 border-[var(--brand-primary)] px-4 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-muted)]"
                      >
                        Ver lista de presença
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
