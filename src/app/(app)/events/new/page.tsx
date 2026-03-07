"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventTimeEnd, setEventTimeEnd] = useState("");
  const [type, setType] = useState<"ensaio" | "evento">("ensaio");
  const [description, setDescription] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("events").insert({
      title: title.trim(),
      event_date: eventDate,
      event_time: eventTime || null,
      event_time_end: eventTimeEnd || null,
      type,
      description: description.trim() || null,
      recurrence_rule: recurrenceRule.trim() || null,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/events");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Novo evento</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Título *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium mb-1">
              Data *
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="eventTime" className="block text-sm font-medium mb-1">
              Hora início
            </label>
            <input
              id="eventTime"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label htmlFor="eventTimeEnd" className="block text-sm font-medium mb-1">
              Hora fim
            </label>
            <input
              id="eventTimeEnd"
              type="time"
              value={eventTimeEnd}
              onChange={(e) => setEventTimeEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Tipo *
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as "ensaio" | "evento")}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="ensaio">Ensaio</option>
            <option value="evento">Evento</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="recurrenceRule" className="block text-sm font-medium mb-1">
            Recorrência (ex: weekly)
          </label>
          <input
            id="recurrenceRule"
            type="text"
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value)}
            placeholder="weekly"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando…" : "Salvar"}
          </button>
          <Link
            href="/events"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
