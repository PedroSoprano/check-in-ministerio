import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return (
      <div className="max-w-md">
        <h1 className="text-xl font-bold mb-4">Meus check-ins</h1>
        <p className="text-gray-600">
          Seu cadastro ainda não foi vinculado a um membro do ministério. Entre
          em contato com o administrador para que ele associe sua conta ao seu
          nome na lista.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select(
      `
      id,
      event_id,
      created_at,
      meditation_done,
      verses_memorized,
      events ( title, event_date, event_time )
    `
    )
    .eq("member_id", member.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const attendedEventIds = new Set(
    (checkIns ?? []).map((c: Record<string, unknown>) => c.event_id as string).filter(Boolean)
  );

  const { data: pastEvents } = await supabase
    .from("events")
    .select("id, title, event_date, event_time")
    .lte("event_date", today)
    .order("event_date", { ascending: false })
    .limit(80);

  const eventsNotAttended = (pastEvents ?? []).filter(
    (e: { id: string }) => !attendedEventIds.has(e.id)
  );

  function formatEventDate(dateStr: string, timeStr: string | null) {
    const d = new Date(dateStr + (timeStr ? "T" + timeStr : "T12:00:00"));
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(timeStr ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-2">Meus check-ins</h1>
        <p className="text-gray-600 mb-6">Olá, {member.name}.</p>

        <h2 className="text-base font-semibold text-teal-800 mb-3">Eventos que participei</h2>
        {!checkIns?.length ? (
          <p className="text-gray-500">Você ainda não tem check-ins registrados.</p>
        ) : (
          <ul className="space-y-3">
            {checkIns.map((c: Record<string, unknown>) => {
              const meditationDone = Boolean(c.meditation_done);
              const verses = Number(c.verses_memorized) || 0;
              return (
                <li
                  key={c.id as string}
                  className="p-3 rounded-xl border-2 border-teal-200 bg-teal-50/80 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {c.events && typeof c.events === "object" && "title" in c.events
                        ? (c.events as { title?: string }).title
                        : "Evento"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(c.created_at as string).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3" aria-label="Meditação e versículos">
                    <span
                      className={`flex items-center gap-1.5 ${!meditationDone ? "text-red-600" : ""}`}
                      title="Meditação"
                    >
                      <span
                        className={`inline-block w-4 h-4 rounded-full border-2 shrink-0 ${
                          meditationDone
                            ? "bg-teal-500 border-teal-600"
                            : "bg-transparent border-red-400"
                        }`}
                        aria-hidden
                      />
                      <span className={`text-xs ${meditationDone ? "text-gray-600" : "text-red-600"}`}>
                        Meditação
                      </span>
                    </span>
                    <span
                      className="flex items-center gap-1.5"
                      title={verses === 1 ? "1 versículo" : `${verses} versículos`}
                    >
                      <span className="flex gap-0.5" aria-hidden>
                        {Array.from({ length: Math.min(verses, 10) }).map((_, i) => (
                          <span
                            key={i}
                            className="inline-block w-3 h-3 rounded-full bg-[var(--brand-primary)] shrink-0"
                          />
                        ))}
                        {verses > 10 && (
                          <span className="text-xs text-gray-600 ml-0.5">+{verses - 10}</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-600">
                        {verses === 1 ? "1 versículo" : `${verses} versículos`}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Eventos que não fui</h2>
        {eventsNotAttended.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Você participou de todos os eventos recentes ou não há eventos passados.
          </p>
        ) : (
          <ul className="space-y-2">
            {eventsNotAttended.map((e: { id: string; title: string; event_date: string; event_time: string | null }) => (
              <li
                key={e.id}
                className="py-2 px-3 rounded-xl border border-gray-200 bg-gray-100/80 text-gray-600 text-sm flex flex-wrap items-center gap-2"
              >
                <span className="font-medium text-gray-800">{e.title}</span>
                <span>
                  {formatEventDate(e.event_date, e.event_time)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
