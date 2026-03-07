import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MemberStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, name, email")
    .eq("id", id)
    .single();

  if (memberError || !member) notFound();

  const [
    { count: totalCheckIns },
    { data: checkIns },
  ] = await Promise.all([
    supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("member_id", id),
    supabase
      .from("check_ins")
      .select("id, meditation_done, verses_memorized, created_at, events(title, event_date, event_time)")
      .eq("member_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const list = (checkIns ?? []) as Array<{
    id: string;
    meditation_done: boolean;
    verses_memorized: number;
    created_at: string;
    events: { title: string; event_date: string; event_time: string | null } | null;
  }>;

  const totalVerses = list.reduce((s, c) => s + (c.verses_memorized ?? 0), 0);
  const totalMeditations = list.reduce((s, c) => s + (c.meditation_done ? 1 : 0), 0);
  const totalVersesAll = totalVerses;
  const totalMeditationsAll = totalMeditations;

  function formatDate(s: string) {
    const d = String(s).slice(0, 10);
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }
  function formatTime(t: string | null) {
    if (!t) return "";
    return String(t).slice(0, 5);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/members" className="text-sm text-blue-600 hover:underline">
          ← Membros
        </Link>
      </div>
      <h1 className="text-xl font-bold mb-2">Estatísticas — {member.name}</h1>
      {member.email && (
        <p className="text-sm text-gray-500 mb-6">{member.email}</p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
        <div className="p-4 border border-gray-200 rounded">
          <p className="text-sm text-gray-500">Check-ins (total)</p>
          <p className="text-2xl font-semibold">{totalCheckIns ?? 0}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded">
          <p className="text-sm text-gray-500">Versículos memorizados</p>
          <p className="text-2xl font-semibold">{totalVersesAll}</p>
          <p className="text-xs text-gray-400">(soma nos últimos 100)</p>
        </div>
        <div className="p-4 border border-gray-200 rounded">
          <p className="text-sm text-gray-500">Meditações feitas</p>
          <p className="text-2xl font-semibold">{totalMeditationsAll}</p>
          <p className="text-xs text-gray-400">(soma nos últimos 100)</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Histórico de presenças (últimos 100)</h2>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum check-in registrado.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded text-sm"
            >
              <div>
                <span className="font-medium">
                  {c.events?.title ?? "Evento"}
                </span>
                <span className="text-gray-500 ml-2">
                  {c.events?.event_date ? formatDate(c.events.event_date) : ""}
                  {c.events?.event_time
                    ? ` ${formatTime(c.events.event_time)}`
                    : ""}
                </span>
              </div>
              <div className="text-gray-600">
                {c.verses_memorized > 0 && `${c.verses_memorized} vers. `}
                {c.meditation_done && "✓ Meditação"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
