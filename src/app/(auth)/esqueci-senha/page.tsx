"use client";

import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { useState } from "react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/atualizar-senha`
        : "https://check-in-ministerio.vercel.app/atualizar-senha";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("E-mail enviado. Verifique sua caixa de entrada.");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-5 pb-6 safe-area-padding bg-gradient-to-b from-[var(--brand-muted)] to-white">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Logo width={160} height={56} />
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
            Esqueci minha senha
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Informe seu e-mail e enviaremos um link para redefinir a senha.
          </p>
        </div>
        {sent ? (
          <div className="space-y-4">
            <p className="text-center text-green-700 text-sm bg-green-50 p-4 rounded-lg border border-green-200">
              Se existir uma conta com esse e-mail, você receberá um link para
              redefinir a senha. Verifique também a pasta de spam.
            </p>
            <Link
              href="/login"
              className="block w-full min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] text-white rounded-xl text-base font-medium hover:bg-[var(--brand-primary-hover)] text-center"
            >
              Voltar para Entrar
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                E-mail
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
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] text-white rounded-xl text-base font-medium hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] disabled:opacity-50 touch-manipulation shadow-sm"
            >
              {loading ? "Enviando…" : "Enviar link"}
            </button>
          </form>
        )}
        <p className="text-center text-sm">
          <Link
            href="/login"
            className="text-[var(--brand-primary)] font-medium hover:underline min-h-[44px] inline-flex items-center"
          >
            Voltar para Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
