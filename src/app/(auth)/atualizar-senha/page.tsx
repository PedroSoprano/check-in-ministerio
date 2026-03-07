"use client";

import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AtualizarSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (type === "recovery" && accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => {
          setReady(true);
          if (typeof window !== "undefined") {
            window.history.replaceState(null, "", window.location.pathname);
          }
        })
        .catch(() => toast.error("Link inválido ou expirado."))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
      if (!hash && typeof window !== "undefined") {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) setReady(true);
        });
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha alterada. Redirecionando…");
    router.push("/me");
    router.refresh();
  }

  if (checking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-5 pb-6 safe-area-padding bg-gradient-to-b from-[var(--brand-muted)] to-white">
        <div className="w-full max-w-sm text-center">
          <Logo width={160} height={56} className="mx-auto mb-4" />
          <p className="text-gray-600">Verificando link…</p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-5 pb-6 safe-area-padding bg-gradient-to-b from-[var(--brand-muted)] to-white">
        <div className="w-full max-w-sm space-y-4 text-center">
          <Logo width={160} height={56} className="mx-auto" />
          <p className="text-gray-600">
            Link inválido ou expirado. Solicite um novo link em &quot;Esqueci minha
            senha&quot;.
          </p>
          <Link
            href="/esqueci-senha"
            className="inline-block min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] text-white rounded-xl text-base font-medium hover:bg-[var(--brand-primary-hover)]"
          >
            Nova redefinição
          </Link>
          <p className="text-sm">
            <Link href="/login" className="text-[var(--brand-primary)] hover:underline">
              Voltar para Entrar
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-5 pb-6 safe-area-padding bg-gradient-to-b from-[var(--brand-muted)] to-white">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Logo width={160} height={56} />
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
            Nova senha
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Digite e confirme sua nova senha (mínimo 6 caracteres).
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] text-base"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium mb-1">
              Confirmar senha
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] text-base"
              placeholder="Repita a senha"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] text-white rounded-xl text-base font-medium hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] disabled:opacity-50 touch-manipulation shadow-sm"
          >
            {loading ? "Salvando…" : "Definir nova senha"}
          </button>
        </form>
        <p className="text-center text-sm">
          <Link href="/login" className="text-gray-500 hover:underline">
            Voltar para Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
