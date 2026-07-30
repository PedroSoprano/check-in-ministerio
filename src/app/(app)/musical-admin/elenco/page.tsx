"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/client";
import { Loading } from "@/components/Loading";
import { fetchActiveProduction } from "@/lib/musical/api";
import { entranceSideLabel, type EntranceSide } from "@/lib/musical/types";

type Participant = { id: string; name: string; active: boolean; member_id: string | null };
type Scene = { id: string; name: string; sort_order: number };
type Piece = { id: string; scene_id: string; name: string; sort_order: number };
type Assignment = {
  id: string;
  piece_id: string;
  participant_id: string;
  entrance_side: EntranceSide;
  note: string | null;
};

export default function MusicalElencoPage() {
  const [loading, setLoading] = useState(true);
  const [productionId, setProductionId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newName, setNewName] = useState("");
  const [assignParticipantId, setAssignParticipantId] = useState("");
  const [assignPieceId, setAssignPieceId] = useState("");
  const [assignSide, setAssignSide] = useState<"" | "arvore" | "prateleira">("");
  const [saving, setSaving] = useState(false);

  const pieceLabel = useMemo(() => {
    const sceneById = new Map(scenes.map((s) => [s.id, s.name]));
    return (pieceId: string) => {
      const p = pieces.find((x) => x.id === pieceId);
      if (!p) return pieceId;
      return `${sceneById.get(p.scene_id) ?? "?"} · ${p.name}`;
    };
  }, [pieces, scenes]);

  async function reload(prodId: string) {
    const supabase = createClient();
    const [pRes, sRes, piRes, aRes] = await Promise.all([
      supabase
        .from("musical_participants")
        .select("id, name, active, member_id")
        .eq("production_id", prodId)
        .order("name"),
      supabase
        .from("musical_scenes")
        .select("id, name, sort_order")
        .eq("production_id", prodId)
        .order("sort_order"),
      supabase
        .from("musical_pieces")
        .select("id, scene_id, name, sort_order")
        .order("sort_order"),
      supabase
        .from("cast_assignments")
        .select("id, piece_id, participant_id, entrance_side, note"),
    ]);
    if (pRes.error) throw pRes.error;
    if (sRes.error) throw sRes.error;
    if (piRes.error) throw piRes.error;
    if (aRes.error) throw aRes.error;
    setParticipants(pRes.data ?? []);
    setScenes(sRes.data ?? []);
    const sceneIds = new Set((sRes.data ?? []).map((s) => s.id));
    setPieces((piRes.data ?? []).filter((p) => sceneIds.has(p.scene_id)));
    setAssignments((aRes.data ?? []) as Assignment[]);
  }

  useEffect(() => {
    async function load() {
      try {
        const production = await fetchActiveProduction();
        if (!production) {
          toast.error("Nenhuma produção ativa.");
          setLoading(false);
          return;
        }
        setProductionId(production.id);
        await reload(production.id);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao carregar elenco.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!productionId || !newName.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("musical_participants").insert({
      production_id: productionId,
      name: newName.trim(),
      active: true,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewName("");
    toast.success("Participante adicionado.");
    await reload(productionId);
  }

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!productionId || !assignParticipantId || !assignPieceId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("cast_assignments").insert({
      participant_id: assignParticipantId,
      piece_id: assignPieceId,
      entrance_side: assignSide || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Atribuição criada.");
    setAssignParticipantId("");
    setAssignPieceId("");
    setAssignSide("");
    await reload(productionId);
  }

  async function removeAssignment(id: string) {
    if (!productionId) return;
    if (!confirm("Remover esta atribuição?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("cast_assignments").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await reload(productionId);
  }

  async function toggleParticipantActive(p: Participant) {
    if (!productionId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("musical_participants")
      .update({ active: !p.active })
      .eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await reload(productionId);
  }

  if (loading) return <Loading />;

  const nameById = new Map(participants.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Elenco do musical</h1>
          <p className="text-sm text-gray-600">
            Participantes (ajudantes) e atribuições por peça e lado de entrada.
          </p>
        </div>
        <Link href="/musical-admin" className="text-sm text-[var(--brand-primary)] hover:underline">
          Voltar
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Participantes</h2>
        <form onSubmit={addParticipant} className="flex flex-col sm:flex-row gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do ajudante / participante"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white max-h-64 overflow-auto">
          {participants.map((p) => (
            <li key={p.id} className="px-3 py-2 flex items-center justify-between gap-2 text-sm">
              <span className={p.active ? "text-gray-900" : "text-gray-400 line-through"}>
                {p.name}
              </span>
              <button
                type="button"
                onClick={() => toggleParticipantActive(p)}
                className="text-xs text-[var(--brand-primary)] hover:underline"
              >
                {p.active ? "Desativar" : "Ativar"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Nova atribuição</h2>
        <form onSubmit={addAssignment} className="grid gap-2 sm:grid-cols-2">
          <select
            value={assignParticipantId}
            onChange={(e) => setAssignParticipantId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Participante…</option>
            {participants
              .filter((p) => p.active)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
          <select
            value={assignPieceId}
            onChange={(e) => setAssignPieceId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Peça / cena…</option>
            {pieces.map((p) => (
              <option key={p.id} value={p.id}>
                {pieceLabel(p.id)}
              </option>
            ))}
          </select>
          <select
            value={assignSide}
            onChange={(e) => setAssignSide(e.target.value as typeof assignSide)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Lado de entrada (—)</option>
            <option value="arvore">Árvore</option>
            <option value="prateleira">Prateleira</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-50"
          >
            Atribuir
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Atribuições</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {assignments.map((a) => (
            <li key={a.id} className="px-3 py-2 flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <div className="font-medium truncate">{nameById.get(a.participant_id) ?? "?"}</div>
                <div className="text-gray-500 truncate">
                  {pieceLabel(a.piece_id)}
                  {a.entrance_side ? ` · ${entranceSideLabel(a.entrance_side)}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAssignment(a.id)}
                className="text-xs text-red-600 hover:underline shrink-0"
              >
                Remover
              </button>
            </li>
          ))}
          {assignments.length === 0 && (
            <li className="px-3 py-4 text-sm text-gray-500">Nenhuma atribuição.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
