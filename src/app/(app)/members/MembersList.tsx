"use client";

import { createClient } from "@/lib/supabase/client";
import { IconDelete, IconEdit, IconStats } from "@/components/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

type Member = {
  id: string;
  name: string;
  email: string | null;
  matricula_senib: string | null;
  sex: string | null;
  active: boolean;
  user_id: string | null;
};

const sexLabel: Record<string, string> = { M: "Masculino", F: "Feminino" };

function matchMember(m: Member, nameQuery: string, sexFilter: string) {
  const nameMatch =
    !nameQuery.trim() ||
    m.name.toLowerCase().includes(nameQuery.trim().toLowerCase());
  const sexMatch =
    !sexFilter || sexFilter === "todos" || m.sex === sexFilter;
  return nameMatch && sexMatch;
}

export default function MembersList({ initialMembers }: { initialMembers: Member[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterSex, setFilterSex] = useState<string>("todos");

  const filtered = useMemo(
    () =>
      initialMembers.filter((m) => matchMember(m, filterName, filterSex)),
    [initialMembers, filterName, filterSex]
  );

  async function handleDelete(m: Member) {
    if (!confirm(`Excluir o membro "${m.name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(m.id);
    const supabase = createClient();
    await supabase.from("members").delete().eq("id", m.id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="members-filter-name" className="sr-only">
          Filtrar por nome
        </label>
        <input
          id="members-filter-name"
          type="search"
          placeholder="Filtrar por nome..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="min-w-[180px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          autoComplete="off"
        />
        <label htmlFor="members-filter-sex" className="sr-only">
          Filtrar por sexo
        </label>
        <select
          id="members-filter-sex"
          value={filterSex}
          onChange={(e) => setFilterSex(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        >
          <option value="todos">Todos</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
      </div>

      <ul className="space-y-2">
        {filtered.map((m) => (
          <li
            key={m.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-xl bg-white shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate" title={m.name}>
                {m.name}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mt-0.5">
                {m.sex && (
                  <span className="shrink-0">{sexLabel[m.sex] ?? m.sex}</span>
                )}
                {m.email && (
                  <span className="truncate max-w-[240px] sm:max-w-none" title={m.email}>
                    {m.email}
                  </span>
                )}
                {m.matricula_senib && (
                  <span className="shrink-0">SENIB: {m.matricula_senib}</span>
                )}
                {!m.active && (
                  <span className="shrink-0 text-amber-600">(inativo)</span>
                )}
                {m.user_id && (
                  <span className="shrink-0 text-green-600">conta vinculada</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
              <Link
                href={`/members/${m.id}/stats`}
                className="p-2 rounded-lg text-[var(--brand-primary)] hover:bg-[var(--brand-muted)]"
                title="Estatísticas"
              >
                <IconStats />
              </Link>
              <Link
                href={`/members/${m.id}/edit`}
                className="p-2 rounded-lg text-[var(--brand-primary)] hover:bg-[var(--brand-muted)]"
                title="Editar"
              >
                <IconEdit />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(m)}
                disabled={!!deletingId}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                title="Excluir"
              >
                <IconDelete />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm">
          {initialMembers.length === 0
            ? "Nenhum membro cadastrado."
            : "Nenhum resultado para o filtro."}
        </p>
      )}
    </div>
  );
}
