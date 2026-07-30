export type RsvpStatus = "confirmed" | "declined" | null;

export type EntranceSide = "arvore" | "prateleira" | null;

export type MusicalSession = {
  id: string;
  production_id: string;
  session_date: string;
  session_time: string | null;
  type: "ensaio" | "apresentacao";
  title: string;
  description: string | null;
};

export type CastRow = {
  assignmentId: string;
  participantId: string;
  participantName: string;
  pieceId: string;
  pieceName: string;
  sceneId: string;
  sceneName: string;
  sceneSort: number;
  entranceSide: EntranceSide;
  note: string | null;
  status: RsvpStatus;
};

export type SectionGroup = {
  key: string;
  title: string;
  sceneSort: number;
  sideOrder: number;
  rows: CastRow[];
};

export function entranceSideLabel(side: EntranceSide): string | null {
  if (side === "arvore") return "Árvore";
  if (side === "prateleira") return "Prateleira";
  return null;
}

/** Texto claro para a pessoa: seção, entrada e peça. */
export function formatAssignmentForPerson(row: {
  sceneName: string;
  pieceName: string;
  entranceSide: EntranceSide;
}): { scene: string; entrance: string | null; piece: string } {
  const piece =
    row.pieceName === "Elenco" || row.pieceName === row.sceneName
      ? row.sceneName
      : row.pieceName;
  return {
    scene: row.sceneName,
    entrance: entranceSideLabel(row.entranceSide),
    piece,
  };
}

export function sectionTitle(sceneName: string, side: EntranceSide): string {
  const sideLabel = entranceSideLabel(side);
  return sideLabel ? `${sceneName} — ${sideLabel}` : sceneName;
}

export function sideSortOrder(side: EntranceSide): number {
  if (side === "arvore") return 1;
  if (side === "prateleira") return 2;
  return 3;
}

export function groupCastBySection(rows: CastRow[]): SectionGroup[] {
  const map = new Map<string, SectionGroup>();
  for (const row of rows) {
    const key = `${row.sceneId}:${row.entranceSide ?? "none"}`;
    let group = map.get(key);
    if (!group) {
      group = {
        key,
        title: sectionTitle(row.sceneName, row.entranceSide),
        sceneSort: row.sceneSort,
        sideOrder: sideSortOrder(row.entranceSide),
        rows: [],
      };
      map.set(key, group);
    }
    group.rows.push(row);
  }
  return Array.from(map.values()).sort(
    (a, b) => a.sceneSort - b.sceneSort || a.sideOrder - b.sideOrder
  );
}

export function rsvpCounts(rows: CastRow[]) {
  const unique = new Map<string, RsvpStatus>();
  for (const r of rows) {
    if (!unique.has(r.participantId)) unique.set(r.participantId, r.status);
  }
  let confirmed = 0;
  let declined = 0;
  let pending = 0;
  for (const status of unique.values()) {
    if (status === "confirmed") confirmed++;
    else if (status === "declined") declined++;
    else pending++;
  }
  return { total: unique.size, confirmed, declined, pending };
}

export function formatSessionDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function sessionTypeLabel(type: string) {
  return type === "apresentacao" ? "Apresentação" : "Ensaio";
}
