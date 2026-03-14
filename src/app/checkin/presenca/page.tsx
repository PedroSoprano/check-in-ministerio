"use client";

import { Loading } from "@/components/Loading";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type CheckinItem = { id: string; member_id: string; member_name: string; created_at: string };
type EventItem = { id: string; title: string; event_date: string; event_time: string | null; event_time_end?: string | null };

function PresencaPageContent() {
  const searchParams = useSearchParams();
  const dateFromUrl = searchParams.get("date");
  const eventIdFromUrl = searchParams.get("event_id");

  const [list, setList] = useState<CheckinItem[]>([]);
  const [eventInfo, setEventInfo] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  const date =
    dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)
      ? dateFromUrl
      : new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function load() {
      const eventId = eventIdFromUrl || undefined;
      const url = eventId
        ? `/api/checkin/today?date=${date}&event_id=${encodeURIComponent(eventId)}`
        : `/api/checkin/today?date=${date}`;
      const res = await fetch(url).then((r) => r.json()).catch(() => []);
      setList(Array.isArray(res) ? res : []);

      if (eventId) {
        const eventsRes = await fetch(`/api/events/today?date=${date}`).then((r) => r.json()).catch(() => []);
        const events = Array.isArray(eventsRes) ? eventsRes : [];
        const ev = events.find((e: EventItem) => e.id === eventId);
        setEventInfo(ev ?? null);
      } else {
        setEventInfo(null);
      }
      setLoading(false);
    }
    load();
  }, [date, eventIdFromUrl]);

  const checkinLink = eventIdFromUrl
    ? `/checkin?date=${date}&event_id=${encodeURIComponent(eventIdFromUrl)}`
    : `/checkin?date=${date}`;
  const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading) return <Loading fullPage />;

  return (
    <main className="min-h-screen px-5 pt-5 pb-6 sm:p-6 max-w-lg mx-auto bg-gradient-to-b from-[var(--brand-muted)] to-white text-gray-800 safe-area-padding">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <span className="text-lg font-semibold text-gray-800">Presença confirmada</span>
        <Link
          href="/"
          className="min-h-[44px] flex items-center text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] active:underline py-2 shrink-0"
        >
          Início
        </Link>
      </div>

      <p className="text-gray-600 text-sm capitalize mb-4">{dateFormatted}</p>
      {eventInfo && (
        <p className="text-gray-700 font-medium mb-4">
          {eventInfo.title}
          {eventInfo.event_time && (
            <span className="text-gray-500 font-normal text-sm ml-2">
              {String(eventInfo.event_time).slice(0, 5)}
              {eventInfo.event_time_end ? ` – ${String(eventInfo.event_time_end).slice(0, 5)}` : ""}
            </span>
          )}
        </p>
      )}

      <h2 className="text-base font-semibold text-gray-800 mb-3">
        Quem já fez check-in
      </h2>

      {list.length === 0 ? (
        <p className="text-gray-500 text-sm">Ninguém fez check-in ainda.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <span className="font-medium text-gray-900">{item.member_name}</span>
              <span className="text-gray-500 text-sm shrink-0 ml-2">
                {new Date(item.created_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link
          href={checkinLink}
          className="block w-full min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] text-white rounded-xl text-base font-medium text-center hover:bg-[var(--brand-primary-hover)] active:bg-[var(--brand-primary-active)] touch-manipulation shadow-sm"
        >
          Fazer outro check-in
        </Link>
      </div>
    </main>
  );
}

export default function PresencaPage() {
  return (
    <Suspense fallback={<Loading fullPage />}>
      <PresencaPageContent />
    </Suspense>
  );
}
