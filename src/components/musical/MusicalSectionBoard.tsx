"use client";

import type { CastRow, SectionGroup } from "@/lib/musical/types";
import { groupCastBySection, rsvpCounts } from "@/lib/musical/types";

function rowClass(status: CastRow["status"]) {
  if (status === "confirmed") {
    return "bg-[var(--brand-muted)] border-[var(--brand-primary)] text-[var(--brand-primary-active)]";
  }
  if (status === "declined") {
    return "bg-red-50 border-red-300 text-red-800";
  }
  return "bg-white border-gray-200 text-gray-800";
}

function statusLabel(status: CastRow["status"]) {
  if (status === "confirmed") return "Confirmado";
  if (status === "declined") return "Ausente";
  return "Pendente";
}

type Props = {
  rows: CastRow[];
  onToggle?: (participantId: string, next: "confirmed" | "declined" | null) => void;
  allowToggle?: boolean;
};

export function MusicalSectionBoard({ rows, onToggle, allowToggle }: Props) {
  const sections = groupCastBySection(rows);
  const totals = rsvpCounts(rows);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Elenco" value={totals.total} />
        <Stat label="Confirmados" value={totals.confirmed} tone="green" />
        <Stat label="Pendentes" value={totals.pending} />
        <Stat label="Ausências" value={totals.declined} tone="red" />
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <SectionCard
            key={section.key}
            section={section}
            allowToggle={allowToggle}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "green" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "border-[var(--brand-primary)] text-[var(--brand-primary-active)]"
      : tone === "red"
        ? "border-red-300 text-red-700"
        : "border-gray-200 text-gray-800";
  return (
    <div className={`rounded-xl border-2 bg-white px-3 py-3 ${toneClass}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function SectionCard({
  section,
  allowToggle,
  onToggle,
}: {
  section: SectionGroup;
  allowToggle?: boolean;
  onToggle?: Props["onToggle"];
}) {
  const counts = rsvpCounts(section.rows);
  const pct =
    counts.total === 0 ? 0 : Math.round((counts.confirmed / counts.total) * 100);

  return (
    <section className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <header className="px-4 py-3 border-b border-gray-100 bg-[var(--brand-muted)]/60">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-gray-900">{section.title}</h2>
          <span className="text-xs text-gray-600">
            {counts.confirmed}/{counts.total} · {pct}%
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-[var(--brand-primary)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>
      <ul className="divide-y divide-gray-100">
        {section.rows.map((row) => (
          <li
            key={row.assignmentId}
            className={`px-4 py-3 border-l-4 flex items-center justify-between gap-3 ${rowClass(row.status)}`}
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{row.participantName}</div>
              <div className="text-sm opacity-80 truncate">
                {row.pieceName === "Elenco" ? row.sceneName : row.pieceName}
                {row.note ? ` · ${row.note}` : ""}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="text-xs font-medium">{statusLabel(row.status)}</span>
              {allowToggle && onToggle && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onToggle(row.participantId, "confirmed")}
                    className="px-2 py-1 text-xs rounded bg-[var(--brand-primary)] text-white"
                  >
                    Vou
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle(row.participantId, "declined")}
                    className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle(row.participantId, null)}
                    className="px-2 py-1 text-xs rounded border border-gray-300 bg-white text-gray-700"
                  >
                    —
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
