import { createClient } from "@/lib/supabase/client";
import type { CastRow, EntranceSide, RsvpStatus } from "./types";

type AssignmentJoin = {
  id: string;
  entrance_side: string | null;
  note: string | null;
  participant_id: string;
  musical_participants: { id: string; name: string; active: boolean } | null;
  musical_pieces: {
    id: string;
    name: string;
    sort_order: number;
    musical_scenes: {
      id: string;
      name: string;
      sort_order: number;
      production_id: string;
    } | null;
  } | null;
};

export async function fetchActiveProduction() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("productions")
    .select("id, title, start_date, end_date, active")
    .eq("active", true)
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchSessions(productionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("musical_sessions")
    .select("id, production_id, session_date, session_time, type, title, description")
    .eq("production_id", productionId)
    .order("session_date", { ascending: true })
    .order("session_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionCast(sessionId: string, productionId: string): Promise<CastRow[]> {
  const supabase = createClient();
  const [{ data: assignments, error: aErr }, { data: rsvps, error: rErr }] = await Promise.all([
    supabase.from("cast_assignments").select(
      `
        id,
        entrance_side,
        note,
        participant_id,
        musical_participants ( id, name, active ),
        musical_pieces (
          id,
          name,
          sort_order,
          musical_scenes ( id, name, sort_order, production_id )
        )
      `
    ),
    supabase
      .from("musical_rsvps")
      .select("participant_id, status")
      .eq("session_id", sessionId),
  ]);
  if (aErr) throw aErr;
  if (rErr) throw rErr;

  const statusByParticipant = new Map<string, RsvpStatus>();
  for (const r of rsvps ?? []) {
    statusByParticipant.set(r.participant_id, r.status as RsvpStatus);
  }

  const rows: CastRow[] = [];
  for (const a of (assignments ?? []) as unknown as AssignmentJoin[]) {
    const participant = a.musical_participants;
    const piece = a.musical_pieces;
    const scene = piece?.musical_scenes;
    if (!participant || !piece || !scene) continue;
    if (!participant.active) continue;
    if (scene.production_id !== productionId) continue;
    rows.push({
      assignmentId: a.id,
      participantId: participant.id,
      participantName: participant.name,
      pieceId: piece.id,
      pieceName: piece.name,
      sceneId: scene.id,
      sceneName: scene.name,
      sceneSort: scene.sort_order,
      entranceSide: (a.entrance_side as EntranceSide) ?? null,
      note: a.note,
      status: statusByParticipant.get(participant.id) ?? null,
    });
  }

  rows.sort(
    (x, y) =>
      x.sceneSort - y.sceneSort ||
      x.participantName.localeCompare(y.participantName, "pt-BR") ||
      x.pieceName.localeCompare(y.pieceName, "pt-BR")
  );
  return rows;
}

export async function upsertRsvp(
  sessionId: string,
  participantId: string,
  status: "confirmed" | "declined"
) {
  const supabase = createClient();
  const { error } = await supabase.from("musical_rsvps").upsert(
    { session_id: sessionId, participant_id: participantId, status },
    { onConflict: "session_id,participant_id" }
  );
  if (error) throw error;
}

export async function clearRsvp(sessionId: string, participantId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("musical_rsvps")
    .delete()
    .eq("session_id", sessionId)
    .eq("participant_id", participantId);
  if (error) throw error;
}
