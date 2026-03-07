import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
      <header className="border-b border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 shrink-0">
        <nav className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <Link
            href={isAdmin ? "/dashboard" : "/me"}
            className="min-h-[44px] flex items-center font-semibold text-gray-900 py-2"
          >
            Check-in Ministério
          </Link>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {isAdmin && (
              <>
                <Link href="/dashboard" className="min-h-[44px] flex items-center px-3 py-2 text-sm text-gray-600 hover:underline active:text-gray-900 rounded-lg touch-manipulation">
                  Dashboard
                </Link>
                <Link href="/members" className="min-h-[44px] flex items-center px-3 py-2 text-sm text-gray-600 hover:underline active:text-gray-900 rounded-lg touch-manipulation">
                  Membros
                </Link>
                <Link href="/events" className="min-h-[44px] flex items-center px-3 py-2 text-sm text-gray-600 hover:underline active:text-gray-900 rounded-lg touch-manipulation">
                  Eventos
                </Link>
              </>
            )}
            <Link href="/me" className="min-h-[44px] flex items-center px-3 py-2 text-sm text-gray-600 hover:underline active:text-gray-900 rounded-lg touch-manipulation">
              Meus check-ins
            </Link>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="min-h-[44px] flex items-center px-3 py-2 text-sm text-gray-600 hover:underline active:text-gray-900 rounded-lg touch-manipulation"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
