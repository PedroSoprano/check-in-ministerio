import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "admin") redirect("/dashboard");
    redirect("/me");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-5 pb-6 sm:px-8 sm:pt-8 sm:pb-8 gap-8 bg-gradient-to-b from-[var(--brand-muted)] to-white text-gray-800 safe-area-padding">
      <div className="flex flex-col items-center gap-4">
        <Logo width={180} height={64} priority className="drop-shadow-sm" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-700 text-center px-2">
          Ministério de Fantoches
        </h1>
      </div>
      <nav className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link
          href="/checkin"
          className="min-h-[48px] flex items-center justify-center px-5 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-medium shadow-sm hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] transition-colors"
        >
          Fazer check-in
        </Link>
        <Link
          href="/calendario"
          className="min-h-[48px] flex items-center justify-center px-5 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:bg-gray-50 transition-colors"
        >
          Ver programação
        </Link>
        <Link
          href="/login"
          className="min-h-[48px] flex items-center justify-center px-5 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Entrar
        </Link>
      </nav>
    </main>
  );
}
