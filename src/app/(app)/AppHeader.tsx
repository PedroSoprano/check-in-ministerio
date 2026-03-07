"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { IconLogout, IconCalendar, IconMenu, IconClose } from "@/components/Icons";

type Props = { isAdmin: boolean };

const linkClass =
  "min-h-[48px] flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-[var(--brand-muted)] hover:text-[var(--brand-primary)] rounded-lg touch-manipulation transition-colors";

export function AppHeader({ isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="border-b border-gray-200 bg-white shrink-0 safe-area-padding py-3 shadow-sm">
        <nav className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <Link
            href={isAdmin ? "/dashboard" : "/me"}
            className="min-h-[44px] flex items-center gap-2 py-2 min-w-0"
            onClick={() => setOpen(false)}
          >
            <Logo width={100} height={36} className="shrink-0 hidden sm:block" />
            <span className="font-semibold text-gray-900 truncate">
              Ministério de Fantoches
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:bg-[var(--brand-muted)] hover:text-[var(--brand-primary)] touch-manipulation"
            aria-label="Abrir menu"
          >
            <IconMenu title="Menu" />
          </button>
        </nav>
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-xl flex flex-col safe-area-padding"
            role="dialog"
            aria-label="Menu de navegação"
          >
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Fechar menu"
              >
                <IconClose title="Fechar" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {isAdmin && (
                <>
                  <Link
                    href="/hoje"
                    className={linkClass}
                    onClick={() => setOpen(false)}
                  >
                    <IconCalendar title="Presença hoje" />
                    Presença hoje
                  </Link>
                  <Link
                    href="/dashboard"
                    className={linkClass}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/members"
                    className={linkClass}
                    onClick={() => setOpen(false)}
                  >
                    Membros
                  </Link>
                  <Link
                    href="/events"
                    className={linkClass}
                    onClick={() => setOpen(false)}
                  >
                    Eventos
                  </Link>
                </>
              )}
              <Link
                href="/me"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Meus check-ins
              </Link>
              <form action="/api/auth/signout" method="post" className="pt-2">
                <button
                  type="submit"
                  className={`w-full ${linkClass} text-left border-t border-gray-100`}
                >
                  <IconLogout title="Sair" />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
