import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Verifica se o membro já fez check-in para o evento (ou para a data quando sem evento).
 * GET /api/checkin/status?member_id=xxx&event_id=yyy
 * GET /api/checkin/status?member_id=xxx&date=YYYY-MM-DD  (quando não há evento)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("member_id");
    const eventId = searchParams.get("event_id");
    const date = searchParams.get("date");

    if (!memberId) {
      return NextResponse.json(
        { error: "member_id é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    if (eventId) {
      const { data, error } = await supabase
        .from("check_ins")
        .select("id")
        .eq("member_id", memberId)
        .eq("event_id", eventId)
        .limit(1)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ alreadyCheckedIn: !!data?.id });
    }

    const dateToUse =
      date && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : new Date().toISOString().slice(0, 10);

    const { data: list, error } = await supabase
      .from("check_ins")
      .select("id")
      .eq("member_id", memberId)
      .is("event_id", null)
      .gte("created_at", `${dateToUse}T00:00:00`)
      .lt("created_at", `${dateToUse}T23:59:59.999`)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      alreadyCheckedIn: Array.isArray(list) && list.length > 0,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao verificar check-in" },
      { status: 500 }
    );
  }
}
