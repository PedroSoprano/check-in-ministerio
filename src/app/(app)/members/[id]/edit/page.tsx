import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClientMaybe } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import EditMemberForm, {
  type MemberData,
  type ProfileItem,
} from "./EditMemberForm";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") notFound();

  // Preferir service role para sempre encontrar o membro (ignora RLS).
  // Sem SUPABASE_SERVICE_ROLE_KEY no .env, usa o client normal (só vê ativos se não for admin).
  const db = getServiceRoleClientMaybe() ?? supabase;
  const [memberRes, profilesRes] = await Promise.all([
    db
      .from("members")
      .select("id, name, email, matricula_senib, birth_date, sex, active, user_id, role_when_linked")
      .eq("id", id)
      .single(),
    db.from("profiles").select("id, full_name, role").order("full_name", { ascending: true }),
  ]);

  if (memberRes.error || !memberRes.data) {
    if (process.env.NODE_ENV === "development" && memberRes.error) {
      console.error("[Editar membro] Supabase retornou:", memberRes.error);
    }
    notFound();
  }

  const member = memberRes.data as MemberData;
  const profiles = (profilesRes.data ?? []) as ProfileItem[];
  const linkedProfile = member.user_id
    ? profiles.find((p) => p.id === member.user_id)
    : null;
  const initialProfileRole: "user" | "admin" = linkedProfile
    ? (linkedProfile.role === "admin" ? "admin" : "user")
    : (member.role_when_linked === "admin" ? "admin" : "user");

  return (
    <EditMemberForm
      member={member}
      profiles={profiles}
      initialProfileRole={initialProfileRole}
    />
  );
}
