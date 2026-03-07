"use client";

import { createClient } from "@/lib/supabase/client";
import { IconDelete, IconEdit } from "@/components/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_time_end: string | null;
  type: string;
};

export default function EventsList({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(ev: EventRow) {
    if (!confirm(`Excluir o evento "${ev.title}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(ev.id);
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", ev.id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <ul className="space-y-2">
      {events.map((ev) => (
        <li
          key={ev.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded"
        >
          <div>
            <span className="font-medium">{ev.title}</span>
            <span className="text-sm text-gray-500 ml-2">
              {new Date(ev.event_date).toLocaleDateString("pt-BR")}
              {ev.event_time && ` — ${String(ev.event_time).slice(0, 5)}${ev.event_time_end ? ` às ${String(ev.event_time_end).slice(0, 5)}` : ""}`}
            </span>
            <span className="text-xs text-gray-400 ml-2">({ev.type})</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/events/${ev.id}/edit`}
              className="p-2 rounded text-blue-600 hover:bg-blue-50"
              title="Editar"
            >
              <IconEdit />
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(ev)}
              disabled={!!deletingId}
              className="p-2 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="Excluir"
            >
              <IconDelete />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
