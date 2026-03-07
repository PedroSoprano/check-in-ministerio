import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import EventsList from "./EventsList";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, event_time, event_time_end, type")
    .order("event_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Eventos</h1>
        <Link
          href="/events/new"
          className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] text-sm"
        >
          Novo evento
        </Link>
      </div>
      <EventsList events={events ?? []} />
    </div>
  );
}
