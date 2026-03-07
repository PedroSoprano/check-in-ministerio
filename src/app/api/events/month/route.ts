import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Parâmetro month obrigatório (YYYY-MM)" },
        { status: 400 }
      );
    }

    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, m, 0).toISOString().slice(0, 10);

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_date, event_time, event_time_end, type, description")
      .gte("event_date", start)
      .lte("event_date", end)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Erro ao buscar eventos do mês",
      },
      { status: 500 }
    );
  }
}
