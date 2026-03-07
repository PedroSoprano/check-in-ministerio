"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Loading } from "@/components/Loading";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventTimeEnd, setEventTimeEnd] = useState("");
  const [type, setType] = useState<"ensaio" | "evento">("ensaio");
  const [description, setDescription] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("events")
        .select("title, event_date, event_time, event_time_end, type, description, recurrence_rule")
        .eq("id", id)
        .single();
      if (err || !data) {
        setError("Evento não encontrado.");
        setLoading(false);
        return;
      }
      setTitle(data.title ?? "");
      setEventDate((data.event_date as string).slice(0, 10));
      setEventTime(data.event_time ? String(data.event_time).slice(0, 5) : "");
      setEventTimeEnd(data.event_time_end ? String(data.event_time_end).slice(0, 5) : "");
      setType((data.type as "ensaio" | "evento") ?? "ensaio");
      setDescription(data.description ?? "");
      setRecurrenceRule(data.recurrence_rule ?? "");
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
      .from("events")
      .update({
        title: title.trim(),
        event_date: eventDate,
        event_time: eventTime || null,
        event_time_end: eventTimeEnd || null,
        type,
        description: description.trim() || null,
        recurrence_rule: recurrenceRule.trim() || null,
      })
      .eq("id", id);
    setSaving(false);
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Evento atualizado.");
    router.push("/events");
    router.refresh();
  }

  if (loading) return <Loading />;
  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link href="/events" className="text-blue-600 hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Editar evento</h1>
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
            Recorrência
          </label>
          <input
            id="recurrenceRule"
            type="text"
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
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
