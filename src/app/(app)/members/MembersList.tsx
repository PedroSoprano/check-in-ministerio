"use client";

import { createClient } from "@/lib/supabase/client";
import { IconDelete, IconEdit, IconStats } from "@/components/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Member = {
  id: string;
  name: string;
  email: string | null;
  matricula_senib: string | null;
  sex: string | null;
  active: boolean;
  user_id: string | null;
};

export default function MembersList({ initialMembers }: { initialMembers: Member[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sexLabel: Record<string, string> = { M: "Masculino", F: "Feminino", outro: "Outro" };

  async function handleDelete(m: Member) {
    if (!confirm(`Excluir o membro "${m.name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(m.id);
    const supabase = createClient();
    await supabase.from("members").delete().eq("id", m.id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <ul className="space-y-2">
      {initialMembers.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded"
        >
          <div>
            <span className="font-medium">{m.name}</span>
            {m.email && (
              <span className="text-sm text-gray-500 ml-2">({m.email})</span>
            )}
            {m.matricula_senib && (
              <span className="text-sm text-gray-500 ml-2">SENIB: {m.matricula_senib}</span>
            )}
            {m.sex && (
              <span className="text-sm text-gray-500 ml-2">
                — {sexLabel[m.sex] ?? m.sex}
              </span>
            )}
            {!m.active && (
              <span className="text-sm text-amber-600 ml-2">(inativo)</span>
            )}
            {m.user_id && (
              <span className="text-xs text-green-600 ml-2">conta vinculada</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/members/${m.id}/stats`}
              className="p-2 rounded text-blue-600 hover:bg-blue-50"
              title="Estatísticas"
            >
              <IconStats />
            </Link>
            <Link
              href={`/members/${m.id}/edit`}
              className="p-2 rounded text-blue-600 hover:bg-blue-50"
              title="Editar"
            >
              <IconEdit />
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(m)}
              disabled={!!deletingId}
              className="p-2 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="Excluir"
            >
              <IconDelete />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
