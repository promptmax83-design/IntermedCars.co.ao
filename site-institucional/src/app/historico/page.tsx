"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type HistoricoItem = {
  id: number;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: number;
  preco: number;
  status: string;
  consultor_nome: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  concluida: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-600",
  pendente: "bg-amber-100 text-amber-700",
  em_negociacao: "bg-blue-100 text-blue-600",
};

const statusLabels: Record<string, string> = {
  concluida: "Concluida",
  cancelada: "Cancelada",
  pendente: "Pendente",
  em_negociacao: "Em Negociacao",
  aguardando_vistoria: "Aguardando Vistoria",
  vistoriado: "Vistoriado",
};

export default function HistoricoPage() {
  const [items, setItems] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/negotiations/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setItems(d.data || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "todas") return true;
    if (filter === "ativas") return ["pendente", "em_negociacao", "aguardando_vistoria"].includes(item.status);
    if (filter === "concluidas") return item.status === "concluida";
    if (filter === "canceladas") return item.status === "cancelada";
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Historico</h1>
        <p className="text-sm text-slate-500 mb-6">Todas as suas negociacoes e interacoes.</p>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "todas", label: "Todas" },
            { key: "ativas", label: "Ativas" },
            { key: "concluidas", label: "Concluidas" },
            { key: "canceladas", label: "Canceladas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-[var(--imc-verde-terra)] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--imc-verde-terra)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">A carregar historico...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">Nenhum registo encontrado</p>
            <p className="text-xs text-slate-500 mt-1">As suas negociacoes aparecerao aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/negociacao/${item.id}`}
                className="block bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">
                      {item.veiculo_marca} {item.veiculo_modelo}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.veiculo_ano} · {item.consultor_nome || "Sem consultor"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString("pt-AO")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium ${statusColors[item.status] || "bg-slate-100 text-slate-500"}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                    <p className="text-sm font-bold text-[var(--imc-verde-terra)] mt-2">
                      Kz {(item.preco || 0).toLocaleString("pt-AO")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
