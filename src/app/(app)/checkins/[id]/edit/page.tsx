"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Loading } from "@/components/Loading";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCheckinPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [memberName, setMemberName] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [meditationDone, setMeditationDone] = useState(false);
  const [versesMemorized, setVersesMemorized] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("check_ins")
        .select(
          "id, meditation_done, verses_memorized, members(name), events(title, event_date)"
        )
        .eq("id", id)
        .single();
      if (err || !data) {
        setError("Check-in não encontrado.");
        setLoading(false);
        return;
      }
      const row = data as Record<string, unknown>;
      setMeditationDone(Boolean(row.meditation_done));
      setVersesMemorized(Number(row.verses_memorized) || 0);
      const members = row.members as { name: string } | null;
      const events = row.events as { title: string; event_date: string } | null;
      setMemberName(members?.name ?? "Membro");
      setEventTitle(events?.title ?? "Evento");
      setEventDate(
        events?.event_date
          ? new Date(String(events.event_date).slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR")
          : ""
      );
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("check_ins")
      .update({
        meditation_done: meditationDone,
        verses_memorized: Math.max(0, versesMemorized),
      })
      .eq("id", id);
    setSaving(false);
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Check-in atualizado.");
    router.back();
    router.refresh();
  }

  if (loading) return <Loading />;
  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link href="/hoje" className="text-[var(--brand-primary)] hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Editar check-in</h1>
        <p className="text-gray-600 mt-1">
          Ajuste meditação e versículos caso a pessoa tenha esquecido de preencher.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{memberName}</p>
        <p className="text-gray-500">
          {eventTitle}
          {eventDate && ` · ${eventDate}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            id="meditation"
            type="checkbox"
            checked={meditationDone}
            onChange={(e) => setMeditationDone(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="meditation" className="text-sm font-medium">
            Fez meditação
          </label>
        </div>
        <div>
          <label htmlFor="verses" className="block text-sm font-medium mb-1">
            Versículos decorados
          </label>
          <input
            id="verses"
            type="number"
            min={0}
            value={versesMemorized}
            onChange={(e) => setVersesMemorized(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
