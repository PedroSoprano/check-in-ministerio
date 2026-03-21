import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Lista todos os usuários (profiles + email do auth).
 * Apenas admins.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const admin = createServiceRoleClient();
    const { data: authUsers, error: authError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, role, created_at");

    const { data: members } = await admin
      .from("members")
      .select("id, name, user_id, active");

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const memberByUserId = new Map(
      (members ?? []).filter((m) => m.user_id).map((m) => [m.user_id!, m])
    );

    const list = (authUsers.users ?? []).map((u) => {
      const p = profileMap.get(u.id);
      const m = memberByUserId.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        full_name: p?.full_name ?? u.user_metadata?.full_name ?? u.user_metadata?.name ?? "",
        role: p?.role ?? "user",
        created_at: u.created_at,
        member_linked: m ? { id: m.id, name: m.name, active: m.active } : null,
      };
    });

    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao listar usuários" },
      { status: 500 }
    );
  }
}
