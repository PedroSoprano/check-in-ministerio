import Link from "next/link";

export default function EditMemberNotFound() {
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-2">Membro não encontrado</h1>
      <p className="text-gray-600 mb-4">
        O membro que você está tentando editar não existe ou você não tem permissão para acessá-lo.
      </p>
      <Link
        href="/members"
        className="inline-block px-4 py-2 bg-[var(--brand-primary)] text-white rounded hover:bg-[var(--brand-primary-hover)]"
      >
        Voltar para Membros
      </Link>
    </div>
  );
}
