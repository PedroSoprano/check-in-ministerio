import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lista quem já fez check-in no dia (para exibir na tela pública de check-in).
 * GET /api/checkin/today?date=YYYY-MM-DD
 * GET /api/checkin/today?date=YYYY-MM-DD&event_id=uuid  (quando há evento selecionado)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const eventId = searchParams.get("event_id");

    const dateToUse =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : new Date().toISOString().slice(0, 10);

    const dayStart = `${dateToUse}T00:00:00`;
    const dayEnd = `${dateToUse}T23:59:59.999`;

    const supabase = createServiceRoleClient();

    let query = supabase
      .from("check_ins")
      .select("id, member_id, created_at, members(name)")
      .gte("created_at", dayStart)
      .lt("created_at", dayEnd);

    if (eventId) {
      query = query.eq("event_id", eventId);
    } else {
      query = query.is("event_id", null);
    }

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as Array<{
      id: string;
      member_id: string;
      created_at: string;
      members: { name?: string } | { name?: string }[] | null;
    }>;
    const list = rows.map((row) => {
      const m = row.members;
      const name = Array.isArray(m) ? m[0]?.name : m?.name;
      return {
        id: row.id,
        member_id: row.member_id,
        member_name: name ?? "—",
        created_at: row.created_at,
      };
    });

    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao listar check-ins do dia" },
      { status: 500 }
    );
  }
}
