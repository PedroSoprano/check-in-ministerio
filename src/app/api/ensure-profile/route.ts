import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Garante que o usuário logado tenha um registro em public.profiles.
 * Fallback quando o trigger handle_new_user não cria (ex.: RLS no signup).
 * Chamar após signUp no front.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = createServiceRoleClient();
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, created: false });
    }

    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "";

    const { error } = await admin.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: "user",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao garantir perfil" },
      { status: 500 }
    );
  }
}
