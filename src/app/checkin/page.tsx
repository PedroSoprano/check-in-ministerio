"use client";

import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Loading } from "@/components/Loading";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

type Member = { id: string; name: string };
type EventItem = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_time_end?: string | null;
  type: string;
};

function CheckinPageContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [eventsToday, setEventsToday] = useState<EventItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const memberListRef = useRef<HTMLUListElement>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [meditationDone, setMeditationDone] = useState(false);
  const [versesMemorized, setVersesMemorized] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(memberInput.trim().toLowerCase())
  );

  const searchParams = useSearchParams();
  const dateFromUrl = searchParams.get("date");
  const eventIdFromUrl = searchParams.get("event_id");

  function getLocalDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const checkinDate = dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl) ? dateFromUrl : getLocalDate();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [membersRes, eventsRes] = await Promise.all([
        supabase.from("members").select("id, name").eq("active", true).order("name"),
        fetch(`/api/events/today?date=${checkinDate}`).then((r) => r.json()),
      ]);
      if (membersRes.error) {
        setLoadError(membersRes.error.message);
      } else if (membersRes.data) {
        setMembers(membersRes.data);
      }
      if (Array.isArray(eventsRes)) setEventsToday(eventsRes);
      setLoading(false);
    }
    load();
  }, [checkinDate]);

  useEffect(() => {
    if (eventsToday.length === 0) return;
    if (eventIdFromUrl && eventsToday.some((e) => e.id === eventIdFromUrl)) {
      setSelectedEventId(eventIdFromUrl);
    }
  }, [eventsToday, eventIdFromUrl]);

  useEffect(() => {
    if (!selectedMemberId) {
      setAlreadyCheckedIn(false);
      return;
    }
    const eventId = selectedEventId || null;
    const url = eventId
      ? `/api/checkin/status?member_id=${encodeURIComponent(selectedMemberId)}&event_id=${encodeURIComponent(eventId)}`
      : `/api/checkin/status?member_id=${encodeURIComponent(selectedMemberId)}&date=${checkinDate}`;
    fetch(url)
      .then((r) => r.json())
      .then((body) => setAlreadyCheckedIn(!!body.alreadyCheckedIn))
      .catch(() => setAlreadyCheckedIn(false));
  }, [selectedMemberId, selectedEventId, eventsToday, checkinDate]);

  const eventIdToSend = selectedEventId || null;

  function getLocation(): Promise<{ latitude: number; longitude: number } | null> {
    if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMemberId) return;
    if (eventsToday.length > 0 && !selectedEventId) {
      toast.error("Selecione o evento.");
      return;
    }
    if (alreadyCheckedIn) return;
    setSubmitting(true);
    const location = await getLocation();
    const supabase = createClient();
    const payload: Record<string, unknown> = {
      member_id: selectedMemberId,
      event_id: eventIdToSend,
      meditation_done: meditationDone,
      verses_memorized: Math.max(0, versesMemorized),
    };
    if (location) {
      payload.latitude = location.latitude;
      payload.longitude = location.longitude;
    }
    const { error } = await supabase.from("check_ins").insert(payload);
    setSubmitting(false);
    if (error) {
      const isDuplicate = error.code === "23505";
      toast.error(
        isDuplicate
          ? "Este membro já fez check-in para este evento (ou hoje)."
          : error.message
      );
      return;
    }
    toast.success("Presença registrada com sucesso!");
    // Confetti colorido
    const colors = ["#0d9488", "#0f766e", "#e11d48", "#f59e0b", "#8b5cf6", "#06b6d4", "#22c55e", "#ec4899"];
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors });
    confetti({ particleCount: 50, spread: 100, origin: { x: 0.2, y: 0.7 }, colors });
    confetti({ particleCount: 50, spread: 100, origin: { x: 0.8, y: 0.7 }, colors });
    setSelectedMemberId("");
    setMemberInput("");
    setMeditationDone(false);
    setVersesMemorized(0);
    setAlreadyCheckedIn(false);
    setMemberDropdownOpen(false);
  }

  function selectMember(m: Member) {
    setSelectedMemberId(m.id);
    setMemberInput(m.name);
    setMemberDropdownOpen(false);
    setHighlightedIndex(-1);
  }

  function onMemberInputKeyDown(e: React.KeyboardEvent) {
    if (!memberDropdownOpen || filteredMembers.length === 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") setMemberDropdownOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < filteredMembers.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : filteredMembers.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0 && filteredMembers[highlightedIndex]) {
      e.preventDefault();
      selectMember(filteredMembers[highlightedIndex]);
    } else if (e.key === "Escape") {
      setMemberDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  }

  useEffect(() => {
    if (memberDropdownOpen && highlightedIndex >= 0 && memberListRef.current) {
      const el = memberListRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [memberDropdownOpen, highlightedIndex]);

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <main className="min-h-screen px-5 pt-5 pb-6 sm:p-6 max-w-lg mx-auto bg-gradient-to-b from-[var(--brand-muted)] to-white text-gray-800 safe-area-padding">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center min-w-0">
          <span className="text-lg font-semibold text-gray-800 truncate">Check-in</span>
        </div>
        <Link href="/" className="min-h-[44px] flex items-center text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] active:underline py-2 shrink-0">
          Início
        </Link>
      </div>

      {loadError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
          Erro ao carregar membros: {loadError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {eventsToday.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">
              Selecione o evento
            </label>
            <div className="space-y-2">
              {eventsToday.map((ev) => (
                <label
                  key={ev.id}
                  className={`flex items-center gap-3 min-h-[48px] p-4 rounded-lg border cursor-pointer touch-manipulation ${
                    selectedEventId === ev.id
                      ? "border-[var(--brand-primary)] bg-[var(--brand-muted)]"
                      : "border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="event"
                    value={ev.id}
                    checked={selectedEventId === ev.id}
                    onChange={() => setSelectedEventId(ev.id)}
                    className="w-5 h-5 shrink-0 accent-[var(--brand-primary)]"
                  />
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900 block sm:inline">{ev.title}</span>
                    <span className="text-sm text-gray-600 sm:ml-2 block sm:inline">
                      {ev.event_time
                        ? `${String(ev.event_time).slice(0, 5)}${ev.event_time_end ? ` – ${String(ev.event_time_end).slice(0, 5)}` : ""}`
                        : "Horário não definido"}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">({ev.type === "ensaio" ? "Ensaio" : "Evento"})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {eventsToday.length === 0 && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded border border-amber-200 text-sm">
            Não há eventos cadastrados para esta data. Você ainda pode registrar presença (sem vincular a um evento).
          </div>
        )}

        <div className="relative">
          <label htmlFor="member" className="block text-sm font-medium mb-1 text-gray-800">
            Quem está presente?
          </label>
          <input
            ref={memberInputRef}
            id="member"
            type="text"
            value={memberInput}
            onChange={(e) => {
              setMemberInput(e.target.value);
              setSelectedMemberId("");
              setMemberDropdownOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => {
              setMemberDropdownOpen(true);
              setHighlightedIndex(filteredMembers.length > 0 ? 0 : -1);
            }}
            onBlur={() => setTimeout(() => setMemberDropdownOpen(false), 200)}
            onKeyDown={onMemberInputKeyDown}
            placeholder="Digite o nome para buscar..."
            autoComplete="off"
            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] bg-white text-gray-900 text-base"
          />
          {memberDropdownOpen && (
            <ul
              ref={memberListRef}
              role="listbox"
              className="absolute z-10 w-full mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
            >
              {filteredMembers.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500">Nenhum membro encontrado</li>
              ) : (
                filteredMembers.map((m, i) => (
                  <li
                    key={m.id}
                    role="option"
                    aria-selected={selectedMemberId === m.id}
                    className={`min-h-[44px] flex items-center px-4 py-3 text-base cursor-pointer touch-manipulation ${
                      i === highlightedIndex
                        ? "bg-[var(--brand-muted)] text-[var(--brand-primary-active)]"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectMember(m);
                    }}
                  >
                    {m.name}
                  </li>
                ))
              )}
            </ul>
          )}
          <input type="hidden" name="member_id" value={selectedMemberId} />
        </div>

        <div className="flex items-center gap-3 min-h-[48px] py-1">
          <input
            id="meditation"
            type="checkbox"
            checked={meditationDone}
            onChange={(e) => setMeditationDone(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 accent-[var(--brand-primary)] shrink-0"
          />
          <label htmlFor="meditation" className="text-base font-medium text-gray-800 cursor-pointer touch-manipulation">
            Meditei na semana
          </label>
        </div>

        <div>
          <label htmlFor="verses" className="block text-sm font-medium mb-1 text-gray-800">
            Quantos versículos decorei na semana?
          </label>
          <input
            id="verses"
            type="number"
            min={0}
            value={versesMemorized || ""}
            onChange={(e) => setVersesMemorized(parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            inputMode="numeric"
            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] bg-white text-gray-900 text-base"
          />
        </div>

        {alreadyCheckedIn && (
          <div className="p-3 bg-amber-50 text-amber-800 rounded border border-amber-200 text-sm">
            Este membro já fez check-in para este evento. Escolha outra pessoa ou outro evento.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || alreadyCheckedIn}
          className="w-full min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] text-white rounded-xl text-base font-medium hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-sm"
        >
          {submitting ? "Registrando…" : alreadyCheckedIn ? "Já fez check-in" : "Confirmar presença"}
        </button>
      </form>
    </main>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={<Loading fullPage />}>
      <CheckinPageContent />
    </Suspense>
  );
}
