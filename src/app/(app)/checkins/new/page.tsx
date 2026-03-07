"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EventOption = { id: string; title: string; event_date: string; event_time: string | null };

export default function NewCheckinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const memberId = searchParams.get("member_id");
  const eventIdParam = searchParams.get("event_id");
  const dateParam = searchParams.get("date");

  const [memberName, setMemberName] = useState("");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(eventIdParam ?? "");
  const [meditationDone, setMeditationDone] = useState(false);
  const [versesMemorized, setVersesMemorized] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) {
      setError("Membro não informado.");
      setLoading(false);
      return;
    }
    async function load() {
      const supabase = createClient();
      const { data: member } = await supabase
        .from("members")
        .select("name")
        .eq("id", memberId)
        .single();
      if (member) setMemberName(member.name ?? "Membro");

      if (eventIdParam) {
        const { data: ev } = await supabase
          .from("events")
          .select("id, title, event_date, event_time")
          .eq("id", eventIdParam)
          .single();
        if (ev) {
          setEvents([ev as EventOption]);
          setSelectedEventId(eventIdParam);
        }
      } else if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        const { data: evs } = await supabase
          .from("events")
          .select("id, title, event_date, event_time")
          .eq("event_date", dateParam)
          .order("event_time", { ascending: true });
        const list = (evs ?? []) as EventOption[];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
      }
      setLoading(false);
    }
    load();
  }, [memberId, eventIdParam, dateParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    const eventId = selectedEventId || (events.length === 1 ? events[0].id : null);
    if (!eventId) {
      setError("Selecione o evento.");
      return;
    }
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("check_ins").insert({
      member_id: memberId,
      event_id: eventId,
      meditation_done: meditationDone,
      verses_memorized: Math.max(0, versesMemorized),
    });
    setSaving(false);
    if (err) {
      const isDuplicate = err.code === "23505";
      setError(
        isDuplicate
          ? "Este membro já possui check-in para este evento."
          : err.message
      );
      return;
    }
    router.back();
    router.refresh();
  }

  if (loading) return <p className="text-gray-500">Carregando…</p>;
  if (!memberId || error === "Membro não informado.") {
    return (
      <div>
        <p className="text-red-600">Membro não informado.</p>
        <Link href="/hoje" className="text-[var(--brand-primary)] hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const showEventSelect = events.length > 1;

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Criar check-in</h1>
        <p className="text-gray-600 mt-1">
          Registrar presença para quem não fez check-in.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{memberName}</p>
        {showEventSelect ? (
          <div className="mt-2">
            <label htmlFor="event-select" className="block text-xs text-gray-500 mb-1">
              Evento
            </label>
            <select
              id="event-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {new Date(e.event_date + "T12:00:00").toLocaleDateString("pt-BR")}
                  {e.event_time ? ` ${String(e.event_time).slice(0, 5)}` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          selectedEvent && (
            <p className="text-gray-500">
              {selectedEvent.title}
              {" · "}
              {new Date(selectedEvent.event_date + "T12:00:00").toLocaleDateString("pt-BR")}
            </p>
          )
        )}
      </div>

      {events.length === 0 && !eventIdParam ? (
        <p className="text-amber-700 text-sm">Não há eventos nesta data.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="meditation"
              type="checkbox"
              checked={meditationDone}
              onChange={(e) => setMeditationDone(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="meditation" className="text-sm font-medium">
              Fez meditação
            </label>
          </div>
          <div>
            <label htmlFor="verses" className="block text-sm font-medium mb-1">
              Versículos decorados
            </label>
            <input
              id="verses"
              type="number"
              min={0}
              value={versesMemorized}
              onChange={(e) => setVersesMemorized(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Criar check-in"}
            </button>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
