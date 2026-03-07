"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCalendar, IconDownload, IconClose } from "@/components/Icons";

import "leaflet/dist/leaflet.css";

const CheckinMap = dynamic(
  () => import("@/components/CheckinMap").then((m) => ({ default: m.CheckinMap })),
  { ssr: false }
);

type EventForDay = { id: string; title: string; event_date: string; event_time: string | null };

type PresentItem = {
  id: string;
  member_id: string;
  event_id: string;
  meditation_done: boolean;
  verses_memorized: number;
  latitude?: number | null;
  longitude?: number | null;
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
  /** Título da página (ex.: "Presença hoje" ou "Ensaio X - 15/03/2025") */
  titleOverride?: string;
  /** Nome base para exportação PDF/XLSX */
  exportFilenameBase?: string;
  /** Quando definido (vista por evento), criar check-in usa este event_id */
  eventIdForNew?: string;
  /** Eventos do dia (para modal criar check-in quando há vários eventos) */
  eventsForDay?: EventForDay[];
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
  titleOverride,
  exportFilenameBase,
  eventIdForNew,
  eventsForDay = [],
}: Props) {
  const router = useRouter();
  const title = titleOverride ?? "Presença hoje";
  const filenameBase = exportFilenameBase ?? `presenca-${eventDate}`;
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "presentes" | "ausentes">("todos");

  const [selectedPresent, setSelectedPresent] = useState<PresentItem | null>(null);
  const [editMeditation, setEditMeditation] = useState(false);
  const [editVerses, setEditVerses] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [selectedAbsent, setSelectedAbsent] = useState<AbsentItem | null>(null);
  const [createEventId, setCreateEventId] = useState("");
  const [createMeditation, setCreateMeditation] = useState(false);
  const [createVerses, setCreateVerses] = useState(0);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const eventsToPick = eventIdForNew ? [{ id: eventIdForNew, title: "", event_date: eventDate, event_time: null }] : eventsForDay;
  const effectiveCreateEventId = eventIdForNew || createEventId || (eventsToPick.length === 1 ? eventsToPick[0].id : "");

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
    doc.save(`${filenameBase}.pdf`);
  };

  const handleExportXlsx = () => {
    const wb = XLSX.utils.book_new();
    const wsData: string[][] = [
      ["Dia", "Nome", "Meditação", "Versículos"],
      ...tableRows.body,
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Presença");
    XLSX.writeFile(wb, `${filenameBase}.xlsx`);
  };

  function openEditModal(c: PresentItem) {
    setSelectedPresent(c);
    setEditMeditation(c.meditation_done);
    setEditVerses(c.verses_memorized);
    setEditError(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPresent) return;
    setEditError(null);
    setEditSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("check_ins")
      .update({ meditation_done: editMeditation, verses_memorized: Math.max(0, editVerses) })
      .eq("id", selectedPresent.id);
    setEditSaving(false);
    if (error) {
      setEditError(error.message);
      return;
    }
    setSelectedPresent(null);
    router.refresh();
  }

  function openCreateModal(m: AbsentItem) {
    setSelectedAbsent(m);
    setCreateEventId(eventsToPick.length === 1 ? eventsToPick[0].id : eventsToPick[0]?.id ?? "");
    setCreateMeditation(false);
    setCreateVerses(0);
    setCreateError(null);
  }

  async function handleCreateCheckin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAbsent) return;
    const eventId = eventIdForNew || createEventId;
    if (!eventId) {
      setCreateError("Selecione o evento.");
      return;
    }
    setCreateError(null);
    setCreateSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("check_ins").insert({
      member_id: selectedAbsent.id,
      event_id: eventId,
      meditation_done: createMeditation,
      verses_memorized: Math.max(0, createVerses),
    });
    setCreateSaving(false);
    if (error) {
      setCreateError(error.code === "23505" ? "Este membro já possui check-in para este evento." : error.message);
      return;
    }
    setSelectedAbsent(null);
    router.refresh();
  }

  return (
    <div className="print-area space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-[var(--brand-primary)]">
          <IconCalendar title={title} />
        </span>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
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
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="w-full text-left flex flex-col gap-2 p-3 rounded-xl border-2 border-teal-200 bg-teal-50/80 shadow-sm hover:bg-teal-100/80 transition-colors cursor-pointer"
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
                </button>
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
              <li key={m.id}>
                {hasEvents ? (
                  <button
                    type="button"
                    onClick={() => openCreateModal(m)}
                    className="w-full text-left py-2 px-3 rounded-xl border border-gray-200 bg-gray-100/80 text-gray-600 text-sm hover:bg-gray-200/80 transition-colors cursor-pointer"
                  >
                    {m.name}
                  </button>
                ) : (
                  <span className="block py-2 px-3 rounded-xl border border-gray-200 bg-gray-100/80 text-gray-600 text-sm">
                    {m.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {/* Modal Editar check-in */}
      {selectedPresent && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden
            onClick={() => setSelectedPresent(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-label="Detalhes do check-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Check-in</h3>
                <button
                  type="button"
                  onClick={() => setSelectedPresent(null)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Fechar"
                >
                  <IconClose title="Fechar" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="font-medium text-gray-900">{selectedPresent.members?.name ?? "Membro"}</p>
                  <p className="text-sm text-gray-500">
                    {selectedPresent.events?.title ?? "Evento"}
                    {selectedPresent.events?.event_time && ` · ${String(selectedPresent.events.event_time).slice(0, 5)}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span>Meditação: {selectedPresent.meditation_done ? "Sim" : "Não"}</span>
                  <span>Versículos: {selectedPresent.verses_memorized}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Localização: </span>
                  {selectedPresent.latitude != null && selectedPresent.longitude != null ? (
                    <span>{Number(selectedPresent.latitude).toFixed(5)}, {Number(selectedPresent.longitude).toFixed(5)}</span>
                  ) : (
                    <span className="text-gray-400">Não registrada</span>
                  )}
                </div>
                {selectedPresent.latitude != null && selectedPresent.longitude != null && (
                  <CheckinMap
                    latitude={Number(selectedPresent.latitude)}
                    longitude={Number(selectedPresent.longitude)}
                    className="h-52 w-full rounded-lg z-0"
                  />
                )}
                <form onSubmit={handleSaveEdit} className="pt-2 border-t border-gray-100 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Editar</p>
                  <div className="flex items-center gap-2">
                    <input
                      id="edit-meditation"
                      type="checkbox"
                      checked={editMeditation}
                      onChange={(e) => setEditMeditation(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="edit-meditation" className="text-sm">Fez meditação</label>
                  </div>
                  <div>
                    <label htmlFor="edit-verses" className="block text-sm mb-1">Versículos decorados</label>
                    <input
                      id="edit-verses"
                      type="number"
                      min={0}
                      value={editVerses}
                      onChange={(e) => setEditVerses(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  {editError && <p className="text-sm text-red-600">{editError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-50"
                    >
                      {editSaving ? "Salvando…" : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPresent(null)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      Fechar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Criar check-in */}
      {selectedAbsent && hasEvents && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden
            onClick={() => setSelectedAbsent(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-label="Criar check-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Criar check-in</h3>
                <button
                  type="button"
                  onClick={() => setSelectedAbsent(null)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Fechar"
                >
                  <IconClose title="Fechar" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p className="font-medium text-gray-900">{selectedAbsent.name}</p>
                <form onSubmit={handleCreateCheckin} className="space-y-3">
                  {eventsToPick.length > 1 && (
                    <div>
                      <label htmlFor="create-event" className="block text-sm font-medium mb-1">Evento</label>
                      <select
                        id="create-event"
                        value={createEventId}
                        onChange={(e) => setCreateEventId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {eventsToPick.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title} — {new Date(e.event_date + "T12:00:00").toLocaleDateString("pt-BR")}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      id="create-meditation"
                      type="checkbox"
                      checked={createMeditation}
                      onChange={(e) => setCreateMeditation(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="create-meditation" className="text-sm">Fez meditação</label>
                  </div>
                  <div>
                    <label htmlFor="create-verses" className="block text-sm font-medium mb-1">Versículos decorados</label>
                    <input
                      id="create-verses"
                      type="number"
                      min={0}
                      value={createVerses}
                      onChange={(e) => setCreateVerses(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  {createError && <p className="text-sm text-red-600">{createError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createSaving}
                      className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-50"
                    >
                      {createSaving ? "Criando…" : "Criar check-in"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAbsent(null)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
