"use client";

import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/me";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      await fetch("/api/ensure-profile", { method: "POST", credentials: "include" });
      await supabase.rpc("link_member_by_auth_email");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(redirect);
        router.refresh();
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const role = profile?.role ?? "user";
      if (role === "admin") {
        router.push("/dashboard");
      } else {
        router.push(redirect === "/dashboard" ? "/me" : redirect);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-5 pb-6 safe-area-padding bg-gradient-to-b from-[var(--brand-muted)] to-white">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Logo width={160} height={56} />
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">Entrar</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] text-base"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] text-base"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] text-white rounded-xl text-base font-medium hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] disabled:opacity-50 touch-manipulation shadow-sm"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Não tem conta?{" "}
          <Link href="/signup" className="text-[var(--brand-primary)] font-medium hover:underline min-h-[44px] inline-flex items-center">
            Cadastre-se
          </Link>
        </p>
        <p className="text-center text-sm">
          <Link href="/" className="text-gray-500 hover:underline min-h-[44px] inline-flex items-center justify-center">
            Voltar ao início
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Carregando…</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
