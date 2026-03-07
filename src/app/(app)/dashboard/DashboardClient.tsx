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
    <div className="space-y-8">
      {monthlyStats && (
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="p-4 border border-gray-200 rounded">
            <p className="text-sm text-gray-500">Membros ativos</p>
            <p className="text-2xl font-semibold">{monthlyStats.total_members}</p>
          </div>
          <div className="p-4 border border-gray-200 rounded">
            <p className="text-sm text-gray-500">Presença %</p>
            <p className="text-2xl font-semibold">{Number(monthlyStats.presence_percentage)}%</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-2">Presença por dia</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="px-2 py-1 border rounded"
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>
        {attendance.length > 0 && (
          <div className="h-64">
            <Chart
              options={chartOptions}
              series={series}
              type="bar"
              height={256}
            />
          </div>
        )}
        {attendance.length === 0 && (
          <p className="text-gray-500 text-sm">Nenhum dia com programação no período.</p>
        )}
      </div>

      {Object.keys(bySexTotal).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Presença por sexo (período)</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(bySexTotal).map(([sex, total]) => (
              <div key={sex} className="px-4 py-2 bg-gray-100 rounded">
                <span className="font-medium">{sex}</span>: {total} check-ins
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-2">Ausentes há mais de 2 semanas</h2>
        {absentMembers.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum.</p>
        ) : (
          <ul className="space-y-1">
            {absentMembers.slice(0, 10).map((m) => (
              <li key={m.id} className="text-sm">
                {m.name}
                {m.email && ` (${m.email})`}
                {m.days_absent != null && ` — ${m.days_absent} dias`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Ranking de engajamento (mês)</h2>
        {ranking.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum dado.</p>
        ) : (
          <ul className="space-y-1">
            {ranking.slice(0, 10).map((r, i) => (
              <li key={r.id} className="text-sm">
                {i + 1}. {r.name} — {r.total_verses} versículos, {r.total_meditations} meditações
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
