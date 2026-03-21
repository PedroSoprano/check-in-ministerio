import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/admin/users/[id]
 * Remove o usuário da aplicação: desativa o member (para não fazer check-in) e deleta da auth.
 * Apenas admins. Não pode excluir a si mesmo.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

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

    if (user.id === targetUserId) {
      return NextResponse.json(
        { error: "Você não pode excluir sua própria conta" },
        { status: 400 }
      );
    }

    const admin = createServiceRoleClient();

    // 1. Desativar e desvincular member(s) para que não apareçam no check-in via QR
    await admin
      .from("members")
      .update({ active: false, user_id: null })
      .eq("user_id", targetUserId);

    // 3. Deletar o usuário do auth (profiles será removido por cascade)
    const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao excluir usuário" },
      { status: 500 }
    );
  }
}
