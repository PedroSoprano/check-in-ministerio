"use client";

/**
 * Loading na paleta do projeto (teal / brand-primary).
 * Uso: <Loading /> (inline) ou <Loading fullPage /> (tela cheia).
 */
export function Loading({
  fullPage = false,
  label = "Carregando…",
  className = "",
}: {
  fullPage?: boolean;
  label?: string;
  className?: string;
}) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-label={label}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--brand-muted)] border-t-[var(--brand-primary)]"
      />
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--brand-muted)]/30">
        {content}
      </main>
    );
  }

  return (
    <div className="flex min-h-[12rem] items-center justify-center py-8">
      {content}
    </div>
  );
}

export default Loading;
