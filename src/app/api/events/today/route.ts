import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Permite enviar a data no fuso do cliente (ex.: ?date=2025-03-07)
    const dateParam = searchParams.get("date");
    const eventDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : new Date().toISOString().slice(0, 10);

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_date, event_time, event_time_end, type, description")
      .eq("event_date", eventDate)
      .order("event_time", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao buscar evento do dia" },
      { status: 500 }
    );
  }
}
