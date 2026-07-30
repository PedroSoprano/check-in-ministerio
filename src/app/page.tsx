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
    if (profile?.role === "admin") redirect("/hoje");
    redirect("/me");
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[var(--brand-muted)] to-white text-gray-800 safe-area-padding">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8 px-5 pt-5 pb-8 sm:px-8">
      <div className="flex flex-col items-center gap-4">
        <Logo width={180} height={64} priority className="drop-shadow-sm" />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-700 text-center px-2">
          Nova Igreja Batista Tabernáculo
        </h1>
      </div>

      <div className="w-full space-y-5">
        <section className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Ministério de Fantoches</h2>
            <p className="text-sm text-gray-600 mt-1">
              Check-in de ensaios, meditação e programação do ministério.
            </p>
          </div>
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
        </section>

        <section className="rounded-2xl border-2 border-[var(--brand-primary)] bg-[var(--brand-muted)]/40 p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-base font-bold text-[var(--brand-primary-active)]">
              Musical Aladin
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              Confirme se você vai aos ensaios e apresentações (separado do check-in do ministério).
            </p>
          </div>
          <Link
            href="/musical/checkin"
            className="min-h-[48px] flex items-center justify-center px-5 py-3 bg-[var(--brand-primary)] text-white rounded-xl font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            Marcar presença
          </Link>
          <Link
            href="/musical"
            className="min-h-[48px] flex items-center justify-center px-5 py-3 bg-white border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-xl font-medium hover:bg-[var(--brand-muted)] transition-colors"
          >
            Ver programação
          </Link>
        </section>

        <Link
          href="/login"
          className="min-h-[48px] flex items-center justify-center px-5 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors w-full"
        >
          Entrar (equipe / admin)
        </Link>
      </div>
      </div>
    </main>
  );
}
