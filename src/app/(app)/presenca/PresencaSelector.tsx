"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { IconCalendar } from "@/components/Icons";

type EventItem = { id: string; title: string; event_date: string };

export function PresencaSelector({ events }: { events: EventItem[] }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEventId, setSelectedEventId] = useState("");

  function handlePorDia(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/presenca?date=${selectedDate}`);
  }

  function handlePorEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEventId) return;
    router.push(`/presenca?event_id=${encodeURIComponent(selectedEventId)}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <span className="text-[var(--brand-primary)]">
          <IconCalendar title="Presença" />
        </span>
        <h1 className="text-xl font-bold text-gray-900">Tabela de presença</h1>
      </div>
      <p className="text-gray-600">
        Escolha ver a presença por dia (todos os eventos daquele dia) ou por evento específico.
      </p>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-teal-800">Por dia</h2>
        <form onSubmit={handlePorDia} className="flex flex-wrap items-end gap-2">
          <label htmlFor="presenca-date" className="sr-only">Data</label>
          <input
            id="presenca-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)]"
          >
            Ver presença do dia
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-teal-800">Por evento</h2>
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">Não há eventos recentes para listar.</p>
        ) : (
          <form onSubmit={handlePorEvento} className="flex flex-wrap items-end gap-2">
            <label htmlFor="presenca-event" className="sr-only">Evento</label>
            <select
              id="presenca-event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="min-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            >
              <option value="">Selecione um evento</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {new Date(e.event_date + "T12:00:00").toLocaleDateString("pt-BR")}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!selectedEventId}
              className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              Ver presença do evento
            </button>
          </form>
        )}
      </section>

      <p className="text-sm text-gray-500">
        <Link href="/hoje" className="text-[var(--brand-primary)] hover:underline">
          Ir para Presença hoje
        </Link>
      </p>
    </div>
  );
}
