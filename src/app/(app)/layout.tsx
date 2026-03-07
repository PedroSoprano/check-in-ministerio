import { AppHeader } from "@/app/(app)/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=" + encodeURIComponent("/me"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col safe-area-padding">
      <AppHeader isAdmin={!!isAdmin} />
      <main className="flex-1 px-5 pt-4 pb-6 sm:p-6 max-w-4xl mx-auto w-full overflow-x-hidden safe-area-padding">
        {children}
      </main>
    </div>
  );
}
