import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import MembersList from "./MembersList";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("id, name, email, matricula_senib, sex, active, user_id")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Membros</h1>
        <Link
          href="/members/new"
          className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)] text-sm"
        >
          Novo membro
        </Link>
      </div>
      <MembersList initialMembers={members ?? []} />
    </div>
  );
}
