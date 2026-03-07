"use client";

import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { IconCalendar, IconDownload } from "@/components/Icons";

type PresentItem = {
  id: string;
  member_id: string;
  event_id: string;
  meditation_done: boolean;
  verses_memorized: number;
  members: { name: string } | null;
  events: { title: string; event_time: string | null } | null;
};

type AbsentItem = { id: string; name: string };

type Props = {
  present: PresentItem[];
  absent: AbsentItem[];
  dateFormatted: string;
  eventDate: string;
  hasEvents: boolean;
};

function matchName(name: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return name.toLowerCase().includes(q);
}

export function PresencaHojeClient({
  present,
  absent,
  dateFormatted,
  eventDate,
  hasEvents,
}: Props) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "presentes" | "ausentes">("todos");

  const filteredPresent = useMemo(
    () =>
      present.filter((c) =>
        matchName(c.members?.name ?? "", filter)
      ),
    [present, filter]
  );
  const filteredAbsent = useMemo(
    () => absent.filter((m) => matchName(m.name, filter)),
    [absent, filter]
  );

  const tableRows = useMemo(() => {
    const head = ["Dia", "Nome", "Meditação", "Versículos"];
    const body: string[][] = [];
    filteredPresent.forEach((c) => {
      body.push([
        dateFormatted,
        c.members?.name ?? "Membro",
        c.meditation_done ? "Sim" : "Não",
        String(c.verses_memorized),
      ]);
    });
    filteredAbsent.forEach((m) => {
      body.push([dateFormatted, m.name, "—", "—"]);
    });
    return { head: [head], body };
  }, [dateFormatted, filteredPresent, filteredAbsent]);

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(14);
    doc.text(`Presença - ${dateFormatted}`, 14, 15);
    autoTable(doc, {
      head: tableRows.head,
      body: tableRows.body,
      startY: 22,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 148, 136] },
    });
    doc.save(`presenca-${eventDate}.pdf`);
  };

  const handleExportXlsx = () => {
    const wb = XLSX.utils.book_new();
    const wsData: string[][] = [
      ["Dia", "Nome", "Meditação", "Versículos"],
      ...tableRows.body,
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Presença");
    XLSX.writeFile(wb, `presenca-${eventDate}.xlsx`);
  };

  return (
    <div className="print-area space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-[var(--brand-primary)]">
          <IconCalendar title="Presença hoje" />
        </span>
        <h1 className="text-xl font-bold text-gray-900">Presença hoje</h1>
      </div>
      <p className="text-gray-600 capitalize">{dateFormatted}</p>

      <div className="no-print flex flex-wrap items-center gap-2">
        <label htmlFor="filter-name" className="sr-only">
          Filtrar por nome
        </label>
        <input
          id="filter-name"
          type="search"
          placeholder="Filtrar por nome..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          autoComplete="off"
        />
        <label htmlFor="status-filter" className="sr-only">
          Filtrar por status do check-in
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "todos" | "presentes" | "ausentes")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        >
          <option value="todos">Todos</option>
          <option value="presentes">Fizeram check-in</option>
          <option value="ausentes">Não fizeram check-in</option>
        </select>
        <button
          type="button"
          onClick={handleExportPdf}
          className="flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)]"
        >
          <IconDownload title="Exportar PDF" />
          Exportar PDF
        </button>
        <button
          type="button"
          onClick={handleExportXlsx}
          className="flex items-center gap-2 rounded-lg border-2 border-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-muted)] active:bg-teal-100"
        >
          Exportar XLSX
        </button>
      </div>

      {!hasEvents && (
        <p className="rounded-lg bg-amber-50 text-amber-800 p-4 text-sm">
          Não há eventos cadastrados para hoje. Cadastre um evento em Eventos
          para acompanhar os check-ins.
        </p>
      )}

      {(statusFilter === "todos" || statusFilter === "presentes") && (
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-teal-800">
          Fizeram check-in ({filteredPresent.length})
        </h2>
        {filteredPresent.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {present.length === 0
              ? "Ninguém fez check-in ainda."
              : "Nenhum resultado para o filtro."}
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredPresent.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 p-3 rounded-xl border-2 border-teal-200 bg-teal-50/80 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {c.members?.name ?? "Membro"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {c.events?.title ?? "Evento"}
                    {c.events?.event_time && (
                      <span className="ml-1">
                        · {String(c.events.event_time).slice(0, 5)}
                      </span>
                    )}
                  </span>
                </div>
                <div
                  className="flex flex-wrap items-center gap-3"
                  aria-label="Meditação e versículos"
                >
                  <span
                    className={`flex items-center gap-1.5 ${!c.meditation_done ? "text-red-600" : ""}`}
                    title="Meditação"
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full border-2 shrink-0 ${
                        c.meditation_done
                          ? "bg-teal-500 border-teal-600"
                          : "bg-transparent border-red-400"
                      }`}
                      aria-hidden
                    />
                    <span
                      className={`text-xs ${c.meditation_done ? "text-gray-600" : "text-red-600"}`}
                    >
                      Meditação
                    </span>
                  </span>
                  <span
                    className="flex items-center gap-1.5"
                    title={
                      c.verses_memorized === 1
                        ? "1 versículo"
                        : `${c.verses_memorized} versículos`
                    }
                  >
                    <span className="flex gap-0.5" aria-hidden>
                      {Array.from({
                        length: Math.min(c.verses_memorized, 10),
                      }).map((_, i) => (
                        <span
                          key={i}
                          className="inline-block w-3 h-3 rounded-full bg-[var(--brand-primary)] shrink-0"
                        />
                      ))}
                      {c.verses_memorized > 10 && (
                        <span className="text-xs text-gray-600 ml-0.5">
                          +{c.verses_memorized - 10}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-600">
                      {c.verses_memorized === 1
                        ? "1 versículo"
                        : `${c.verses_memorized} versículos`}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {(statusFilter === "todos" || statusFilter === "ausentes") && (
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-700">
          Ainda não fizeram check-in ({filteredAbsent.length})
        </h2>
        {filteredAbsent.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {absent.length === 0
              ? "Todos os membros ativos fizeram check-in hoje."
              : "Nenhum resultado para o filtro."}
          </p>
        ) : (
          <ul className="space-y-1">
            {filteredAbsent.map((m) => (
              <li
                key={m.id}
                className="py-2 px-3 rounded-xl border border-gray-200 bg-gray-100/80 text-gray-600 text-sm"
              >
                {m.name}
              </li>
            ))}
          </ul>
        )}
      </section>
      )}
    </div>
  );
}
