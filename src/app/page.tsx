import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 gap-6 bg-white text-gray-800 safe-area-padding">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center px-2">
        Check-in Ministério de Fantoches
      </h1>
      <nav className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link
          href="/checkin"
          className="min-h-[48px] flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 text-base font-medium"
        >
          Fazer check-in
        </Link>
        <Link
          href="/calendario"
          className="min-h-[48px] flex items-center justify-center px-5 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 active:bg-gray-400 text-base font-medium"
        >
          Ver programação
        </Link>
        <Link
          href="/login"
          className="min-h-[48px] flex items-center justify-center px-5 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-base font-medium"
        >
          Entrar
        </Link>
      </nav>
    </main>
  );
}
