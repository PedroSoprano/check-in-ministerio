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

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select(
      `
      id,
      created_at,
      meditation_done,
      verses_memorized,
      events ( title, event_date, event_time )
    `
    )
    .eq("member_id", member.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Meus check-ins</h1>
      <p className="text-gray-600 mb-6">Olá, {member.name}.</p>

      {!checkIns?.length ? (
        <p className="text-gray-500">Você ainda não tem check-ins registrados.</p>
      ) : (
        <ul className="space-y-3">
          {checkIns.map((c: Record<string, unknown>) => (
            <li
              key={c.id as string}
              className="p-3 border border-gray-200 rounded flex flex-wrap items-center gap-2"
            >
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
              {(c.meditation_done || (c.verses_memorized as number) > 0) && (
                <span className="text-xs text-green-600">
                  {c.meditation_done ? "Meditação " : ""}
                  {(c.verses_memorized as number) > 0
                    ? `${c.verses_memorized} versículo(s)`
                    : ""}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
