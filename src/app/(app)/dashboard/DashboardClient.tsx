"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type AttendanceRow = {
  day: string;
  total_check_ins: number;
  by_sex: Record<string, number> | null;
};
type MonthlyStats = {
  total_members: number;
  members_with_checkin: number;
  presence_percentage: number;
  total_verses: number;
  total_meditations: number;
} | null;
type AbsentMember = {
  id: string;
  name: string;
  email: string | null;
  last_check_in_at: string | null;
  days_absent: number;
};
type RankingRow = {
  id: string;
  name: string;
  total_check_ins: number;
  total_verses: number;
  total_meditations: number;
};

export default function DashboardClient({
  initialAttendance,
  monthlyStats,
  absentMembers,
  ranking,
}: {
  initialAttendance: AttendanceRow[];
  monthlyStats: MonthlyStats;
  absentMembers: AbsentMember[];
  ranking: RankingRow[];
}) {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<AttendanceRow[]>(initialAttendance);

  const loadAttendance = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_attendance_by_day", {
      p_start: start,
      p_end: end,
    });
    setAttendance((data as AttendanceRow[]) ?? []);
  }, [start, end]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const categories = attendance.map((r) => {
    const s = String(r.day).slice(0, 10);
    const [, m, d] = s.split("-");
    return `${d.padStart(2, "0")}/${m}`;
  });
  const series = [
    {
      name: "Check-ins",
      data: attendance.map((r) => Number(r.total_check_ins)),
    },
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: "bar" },
    xaxis: { categories },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "60%" },
    },
    dataLabels: { enabled: false },
  };

  const bySexTotal: Record<string, number> = {};
  attendance.forEach((r) => {
    if (r.by_sex && typeof r.by_sex === "object") {
      Object.entries(r.by_sex).forEach(([k, v]) => {
        bySexTotal[k] = (bySexTotal[k] ?? 0) + Number(v);
      });
    }
  });

  return (
    <div className="space-y-10">
      {monthlyStats && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-lg">
          <div className="p-5 rounded-xl border-2 border-[var(--brand-muted)] bg-white shadow-sm">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Membros ativos</p>
            <p className="text-3xl font-bold text-[var(--brand-primary)] mt-1">{monthlyStats.total_members}</p>
          </div>
          <div className="p-5 rounded-xl border-2 border-[var(--brand-muted)] bg-white shadow-sm">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Presença %</p>
            <p className="text-3xl font-bold text-[var(--brand-primary)] mt-1">{Number(monthlyStats.presence_percentage)}%</p>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Presença por dia</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
          />
        </div>
        {attendance.length > 0 ? (
          <div className="h-64">
            <Chart
              options={{ ...chartOptions, colors: ["#0d9488"] }}
              series={series}
              type="bar"
              height={256}
            />
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">Nenhum dia com programação no período.</p>
        )}
      </section>

      {Object.keys(bySexTotal).length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Presença por sexo (período)</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(bySexTotal).map(([sex, total]) => (
              <div key={sex} className="px-4 py-2.5 rounded-lg bg-[var(--brand-muted)] text-[var(--brand-primary-active)] font-medium">
                <span>{sex}</span>: {total} check-ins
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ausentes há mais de 2 semanas</h2>
        {absentMembers.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum.</p>
        ) : (
          <ul className="space-y-2">
            {absentMembers.slice(0, 10).map((m) => (
              <li key={m.id} className="text-sm py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-900">{m.name}</span>
                {m.email && <span className="text-gray-500"> — {m.email}</span>}
                {m.days_absent != null && <span className="text-amber-600 text-xs font-medium ml-1">({m.days_absent} dias)</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ranking de engajamento (mês)</h2>
        {ranking.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum dado.</p>
        ) : (
          <ul className="space-y-2">
            {ranking.slice(0, 10).map((r, i) => (
              <li key={r.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold">{i + 1}</span>
                <span className="font-medium text-gray-900">{r.name}</span>
                <span className="text-gray-500">— {r.total_verses} versículos, {r.total_meditations} meditações</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
