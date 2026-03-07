import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  const pStart = start.toISOString().slice(0, 10);
  const pEnd = end.toISOString().slice(0, 10);

  const [
    { data: attendanceData },
    { data: monthlyStats },
    { data: absentMembers },
    { data: ranking },
  ] = await Promise.all([
    supabase.rpc("get_attendance_by_day", { p_start: pStart, p_end: pEnd }),
    supabase.rpc("get_monthly_stats"),
    supabase.rpc("get_members_absent_two_weeks"),
    supabase.rpc("get_engagement_ranking"),
  ]);

  const statsRow = Array.isArray(monthlyStats) && monthlyStats[0] ? monthlyStats[0] : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Ministério de Fantoches — visão geral</p>
      </div>
      <DashboardClient
        initialAttendance={attendanceData ?? []}
        monthlyStats={statsRow}
        absentMembers={absentMembers ?? []}
        ranking={ranking ?? []}
      />
    </div>
  );
}
