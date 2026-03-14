import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PresencaHojeClient } from "@/app/(app)/hoje/PresencaHojeClient";
import { PresencaSelector } from "./PresencaSelector";

type PresentItem = {
  id: string;
  member_id: string;
  event_id: string;
  meditation_done: boolean;
  verses_memorized: number;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
  members: { name: string } | null;
  events: { title: string; event_time: string | null } | null;
};

export default async function PresencaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; event_id?: string }>;
}) {
  const params = await searchParams;
  const dateParam = params.date;
  const eventIdParam = params.event_id;

  const supabase = await createClient();

  if (!dateParam && !eventIdParam) {
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date();
    start.setDate(start.getDate() - 90);
    const startStr = start.toISOString().slice(0, 10);
    const { data: events } = await supabase
      .from("events")
      .select("id, title, event_date")
      .gte("event_date", startStr)
      .lte("event_date", today)
      .order("event_date", { ascending: false })
      .limit(80);
    return (
      <div className="space-y-6">
        <PresencaSelector events={events ?? []} />
      </div>
    );
  }

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const eventDate = dateParam;
    const { data: eventsToday } = await supabase
      .from("events")
      .select("id, title, event_date, event_time")
      .eq("event_date", eventDate)
      .order("event_time", { ascending: true });
    const eventIds = (eventsToday ?? []).map((e) => e.id);
    const hasEvents = eventIds.length > 0;

    const { data: members } = await supabase
      .from("members")
      .select("id, name")
      .eq("active", true)
      .order("name");

    let checkInsToday: PresentItem[] = [];
    if (hasEvents) {
      const { data } = await supabase
        .from("check_ins")
        .select(
          "id, member_id, event_id, meditation_done, verses_memorized, latitude, longitude, created_at, members(name), events(title, event_time)"
        )
        .in("event_id", eventIds);
      checkInsToday = (data ?? []) as unknown as PresentItem[];
    }
    const checkedInMemberIds = new Set(checkInsToday.map((c) => c.member_id));
    const present = checkInsToday;
    const absent = (members ?? []).filter((m) => !checkedInMemberIds.has(m.id));
    const dateFormatted = new Date(eventDate + "T12:00:00").toLocaleDateString(
      "pt-BR",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    );
    return (
      <div className="space-y-4">
        <div className="no-print">
          <Link
            href="/presenca"
            className="text-sm text-[var(--brand-primary)] hover:underline"
          >
            ← Ver outra data ou evento
          </Link>
        </div>
        <PresencaHojeClient
          present={present}
          absent={absent}
          dateFormatted={dateFormatted}
          eventDate={eventDate}
          hasEvents={hasEvents}
          titleOverride={`Presença - ${dateFormatted}`}
          eventsForDay={eventsToday ?? []}
        />
      </div>
    );
  }

  if (eventIdParam) {
    const { data: event } = await supabase
      .from("events")
      .select("id, title, event_date, event_time")
      .eq("id", eventIdParam)
      .single();
    if (!event) {
      redirect("/presenca");
    }
    const { data: members } = await supabase
      .from("members")
      .select("id, name")
      .eq("active", true)
      .order("name");
    const { data: checkIns } = await supabase
      .from("check_ins")
      .select(
        "id, member_id, event_id, meditation_done, verses_memorized, latitude, longitude, created_at, members(name), events(title, event_time)"
      )
      .eq("event_id", eventIdParam);
    const present = (checkIns ?? []) as unknown as PresentItem[];
    const checkedInIds = new Set(present.map((c) => c.member_id));
    const absent = (members ?? []).filter((m) => !checkedInIds.has(m.id));
    const eventDateStr = String(event.event_date).slice(0, 10);
    const dateFormatted = new Date(eventDateStr + "T12:00:00").toLocaleDateString(
      "pt-BR",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    );
    const title = `${event.title} — ${dateFormatted}`;
    const exportBase = `presenca-evento-${eventDateStr}-${event.id.slice(0, 8)}`;
    return (
      <div className="space-y-4">
        <div className="no-print">
          <Link
            href="/presenca"
            className="text-sm text-[var(--brand-primary)] hover:underline"
          >
            ← Ver outra data ou evento
          </Link>
        </div>
        <PresencaHojeClient
          present={present}
          absent={absent}
          dateFormatted={dateFormatted}
          eventDate={eventDateStr}
          hasEvents={true}
          titleOverride={title}
          exportFilenameBase={exportBase}
          eventIdForNew={eventIdParam}
        />
      </div>
    );
  }

  redirect("/presenca");
}
