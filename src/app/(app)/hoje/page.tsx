import { createClient } from "@/lib/supabase/server";
import { PresencaHojeClient } from "./PresencaHojeClient";

const today = () => new Date().toISOString().slice(0, 10);

export default async function PresencaHojePage() {
  const supabase = await createClient();
  const eventDate = today();

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

  let checkInsToday: Array<{
    id: string;
    member_id: string;
    event_id: string;
    meditation_done: boolean;
    verses_memorized: number;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    members: { name: string } | null;
    events: { title: string; event_time: string | null } | null;
  }> = [];

  if (hasEvents) {
    const { data } = await supabase
      .from("check_ins")
      .select(
        "id, member_id, event_id, meditation_done, verses_memorized, latitude, longitude, created_at, members(name), events(title, event_time)"
      )
      .in("event_id", eventIds);
    checkInsToday = (data ?? []) as unknown as typeof checkInsToday;
  }

  const checkedInMemberIds = new Set(checkInsToday.map((c) => c.member_id));
  const present = checkInsToday;
  const absent = (members ?? []).filter((m) => !checkedInMemberIds.has(m.id));

  const dateFormatted = new Date(eventDate + "T12:00:00").toLocaleDateString(
    "pt-BR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <PresencaHojeClient
      present={present}
      absent={absent}
      dateFormatted={dateFormatted}
      eventDate={eventDate}
      hasEvents={hasEvents}
      eventsForDay={eventsToday ?? []}
    />
  );
}
