"use client";

import { useEffect, useState } from "react";
import { IconDelete } from "@/components/Icons";
import { toast } from "react-toastify";

type UserItem = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  member_linked: { id: string; name: string; active: boolean } | null;
};

export default function UsersPage() {
  const [list, setList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(u: UserItem) {
    if (!confirm(`Excluir o usuário "${u.full_name || u.email}"? Ele não poderá mais entrar e não aparecerá na lista de check-in.`)) return;
    setDeletingId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao excluir");
        return;
      }
      toast.success("Usuário excluído.");
      setList((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      toast.error("Erro ao excluir usuário.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-500">Carregando usuários…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">Usuários com conta</h1>
        <p className="text-sm text-gray-600">
          Pessoas que se cadastraram e podem entrar na aplicação. Excluir impede login e remove da lista de check-in.
        </p>
      </div>

      <ul className="space-y-2">
        {list.map((u) => (
          <li
            key={u.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-xl bg-white shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900">
                {u.full_name || "—"}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mt-0.5">
                <span className="truncate max-w-[240px] sm:max-w-none" title={u.email}>
                  {u.email}
                </span>
                <span className={`shrink-0 ${u.role === "admin" ? "text-amber-600 font-medium" : "text-gray-500"}`}>
                  {u.role === "admin" ? "admin" : "user"}
                </span>
                {u.member_linked && (
                  <span className="shrink-0 text-green-600">
                    membro: {u.member_linked.name}
                    {!u.member_linked.active && " (inativo)"}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0 self-end sm:self-center">
              {u.role !== "admin" && (
                <button
                  type="button"
                  onClick={() => handleDelete(u)}
                  disabled={!!deletingId}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
                  title="Excluir usuário"
                >
                  <IconDelete title="Excluir" />
                  <span className="text-sm">Excluir</span>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {list.length === 0 && (
        <p className="text-gray-500 text-sm">Nenhum usuário cadastrado.</p>
      )}
    </div>
  );
}
