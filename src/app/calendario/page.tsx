"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_time_end?: string | null;
  type: string;
  description?: string | null;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = String(t).slice(0, 5).split(":");
  return `${h}:${m}`;
}

function formatDateDisplay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildGoogleCalendarUrl(ev: EventItem): string {
  const [y, mo, d] = String(ev.event_date).slice(0, 10).split("-").map(Number);
  const title = encodeURIComponent(ev.title);
  const description = encodeURIComponent(ev.description || "");

  if (ev.event_time) {
    const [h, min] = String(ev.event_time).slice(0, 5).split(":").map(Number);
    const start = new Date(y, mo - 1, d, h, min, 0);
    let end: Date;
    if (ev.event_time_end) {
      const [eh, em] = String(ev.event_time_end).slice(0, 5).split(":").map(Number);
      end = new Date(y, mo - 1, d, eh, em, 0);
    } else {
      end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    }
    const startStr = start.toISOString().replace(/-|:|\.\d{3}/g, "").slice(0, 15) + "Z";
    const endStr = end.toISOString().replace(/-|:|\.\d{3}/g, "").slice(0, 15) + "Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${description}`;
  }

  const start = `${String(y)}${String(mo).padStart(2, "0")}${String(d).padStart(2, "0")}`;
  const endD = new Date(y, mo - 1, d + 1);
  const end = `${endD.getFullYear()}${String(endD.getMonth() + 1).padStart(2, "0")}${String(endD.getDate()).padStart(2, "0")}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}`;
}

export default function CalendarioPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalEvents, setModalEvents] = useState<EventItem[]>([]);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">("calendario");

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const monthParam = `${y}-${String(m).padStart(2, "0")}`;
    const res = await fetch(`/api/events/month?month=${monthParam}`);
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMonth(year, month);
  }, [year, month, loadMonth]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month - 1 + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const eventsByDate: Record<string, EventItem[]> = {};
  events.forEach((ev) => {
    const d = String(ev.event_date).slice(0, 10);
    if (!eventsByDate[d]) eventsByDate[d] = [];
    eventsByDate[d].push(ev);
  });

  const todayStr = getTodayStr();

  const cells: { day: number | null; dateStr: string | null }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < startWeekday) {
      cells.push({ day: null, dateStr: null });
    } else {
      const day = i - startWeekday + 1;
      if (day > daysInMonth) {
        cells.push({ day: null, dateStr: null });
      } else {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        cells.push({ day, dateStr });
      }
    }
  }

  function openDayModal(dateStr: string) {
    setModalDate(dateStr);
    setModalEvents(eventsByDate[dateStr] ?? []);
  }

  return (
    <main className="min-h-screen px-5 pt-5 pb-6 sm:p-6 max-w-4xl mx-auto bg-gradient-to-b from-[var(--brand-muted)] to-white safe-area-padding">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Programação</h1>
        <Link href="/" className="min-h-[44px] flex items-center text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] active:underline py-2 shrink-0">
          Início
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:bg-gray-50 touch-manipulation text-sm font-medium transition-colors"
        >
          ← Anterior
        </button>
        <h2 className="text-base sm:text-lg font-semibold truncate text-center text-gray-800">
          {MONTHS[month - 1]} {year}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:bg-gray-50 touch-manipulation text-sm font-medium transition-colors"
        >
          Próximo →
        </button>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-white/80 rounded-xl border border-gray-200 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setViewMode("calendario")}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
            viewMode === "calendario" ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 active:text-gray-700"
          }`}
        >
          Calendário
        </button>
        <button
          type="button"
          onClick={() => setViewMode("lista")}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
            viewMode === "lista" ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-gray-600 hover:text-gray-900 active:text-gray-700"
          }`}
        >
          Lista
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : viewMode === "lista" ? (
        <ul className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
          {events.length === 0 ? (
            <li className="p-4 text-gray-500 text-sm">Nenhum evento em {MONTHS[month - 1]} {year}.</li>
          ) : (
            events.map((ev) => {
              const dateStr = String(ev.event_date).slice(0, 10);
              const [, m, d] = dateStr.split("-");
              const timeStr = ev.event_time
                ? ev.event_time_end
                  ? `${formatTime(ev.event_time)} – ${formatTime(ev.event_time_end)}`
                  : formatTime(ev.event_time)
                : "Horário não definido";
              return (
                <li
                  key={ev.id}
                  className="flex items-center justify-between min-h-[52px] p-4 sm:p-3 bg-white border-b border-gray-100 last:border-b-0 hover:bg-[var(--brand-muted)] active:bg-teal-50 cursor-pointer touch-manipulation"
                  onClick={() => openDayModal(dateStr)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDayModal(dateStr)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 w-14 shrink-0">
                      {d}/{m}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{ev.title}</p>
                      <p className="text-sm text-gray-600">
                        {timeStr} · {ev.type === "ensaio" ? "Ensaio" : "Evento"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[var(--brand-primary)]">Ver detalhes</span>
                </li>
              );
            })
          )}
        </ul>
      ) : (
        <div className="border border-gray-200 rounded overflow-hidden">
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
              const dayEvents = dateStr ? (eventsByDate[dateStr] ?? []) : [];
              const hasEvents = dayEvents.length > 0;
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={i}
                  className={`min-h-[64px] sm:min-h-[80px] p-1.5 sm:p-2 border-b border-r border-gray-200 last:border-r-0 touch-manipulation ${
                    hasEvents
                      ? "bg-[var(--brand-muted)] hover:bg-teal-100"
                      : "bg-white"
                  } ${isToday ? "ring-2 ring-inset ring-[var(--brand-primary)]" : ""} ${dateStr ? "cursor-pointer" : ""}`}
                  role={dateStr ? "button" : undefined}
                  onClick={() => dateStr && openDayModal(dateStr)}
                  onKeyDown={(e) =>
                    dateStr &&
                    (e.key === "Enter" || e.key === " ") &&
                    openDayModal(dateStr)
                  }
                  tabIndex={dateStr ? 0 : undefined}
                >
                  {day !== null && dateStr && (
                    <>
                      <span
                        className={`text-sm font-medium ${
                          isToday ? "flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white" : ""
                        } ${hasEvents && !isToday ? "text-[var(--brand-primary-active)]" : !isToday ? "text-gray-700" : ""}`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {dayEvents.map((ev) => {
                          const timeStr = ev.event_time
                            ? ev.event_time_end
                              ? `${formatTime(ev.event_time)}–${formatTime(ev.event_time_end)}`
                              : formatTime(ev.event_time)
                            : ev.type === "ensaio" ? "Ensaio" : "Evento";
                          return (
                            <div
                              key={ev.id}
                              className="text-[10px] sm:text-xs truncate px-1 py-0.5 rounded bg-teal-100 text-[var(--brand-primary-active)]"
                              title={`${ev.title} — ${timeStr}`}
                            >
                              {timeStr}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalDate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 safe-area-padding"
          onClick={() => setModalDate(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full max-w-md max-h-[90dvh] sm:max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {formatDateDisplay(modalDate)}
              </h2>
              <button
                type="button"
                onClick={() => setModalDate(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200 text-gray-500"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 overscroll-contain">
              {modalEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum evento neste dia.</p>
              ) : (
                modalEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <p className="font-medium text-gray-900">{ev.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {ev.event_time
                        ? ev.event_time_end
                          ? `${formatTime(ev.event_time)} – ${formatTime(ev.event_time_end)}`
                          : formatTime(ev.event_time)
                        : "Horário não definido"}{" "}
                    ·{" "}
                      {ev.type === "ensaio" ? "Ensaio" : "Evento"}
                    </p>
                    {ev.description && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                        {ev.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-2">
                      <Link
                        href={`/checkin?date=${modalDate}&event_id=${encodeURIComponent(ev.id)}`}
                        className="min-h-[44px] inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] touch-manipulation"
                      >
                        Fazer check-in neste evento
                      </Link>
                      <a
                        href={buildGoogleCalendarUrl(ev)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                      >
                        Adicionar ao Google Agenda
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
