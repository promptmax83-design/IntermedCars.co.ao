"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Negotiation = {
  id: number;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: number;
  preco: number;
  status: string;
  consultor_nome: string;
  comprador_nome: string;
  vendedor_nome: string;
  veiculo_foto: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pendente: "bg-[#f59e0b]/10 text-[#f59e0b]",
  aceite: "bg-[#10b981]/10 text-[#10b981]",
  em_negociacao: "bg-blue-500/10 text-blue-400",
  vistoria: "bg-purple-500/10 text-purple-400",
  concluida: "bg-[#10b981]/10 text-[#10b981]",
  cancelada: "bg-red-500/10 text-red-400",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  aceite: "Aceite",
  em_negociacao: "Em Negociacao",
  vistoria: "Em Vistoria",
  concluida: "Concluida",
  cancelada: "Cancelada",
};

const filters = [
  { key: "todas", label: "Todas" },
  { key: "ativas", label: "Ativas" },
  { key: "concluidas", label: "Concluidas" },
  { key: "canceladas", label: "Canceladas" },
];

const activeStatuses = ["pendente", "aceite", "em_negociacao", "vistoria"];

export default function NegociacoesPage() {
  const router = useRouter();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("todas");

  const fetchNegotiations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/negotiations/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar negociacoes");
      const data = await res.json();
      setNegotiations(data.data || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
    fetchNegotiations();
  }, [router, fetchNegotiations]);

  const filtered = negotiations.filter((neg) => {
    if (filter === "ativas") return activeStatuses.includes(neg.status);
    if (filter === "concluidas") return neg.status === "concluida";
    if (filter === "canceladas") return neg.status === "cancelada";
    return true;
  });

  const formatPrice = (price: number) => {
    return `Kz${price.toLocaleString("pt-AO")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-slate-500">A carregar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">As Minhas Negociacoes</h1>
          <p className="text-sm text-slate-500">
            Acompanhe todas as suas negociacoes.
          </p>
        </div>

        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                f.key === filter
                  ? "bg-[#10b981] text-[#060608] font-semibold"
                  : "bg-slate-100 text-slate-500 border border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">
              Nenhuma negociacao encontrada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((neg) => (
              <Link
                key={neg.id}
                href={`/negociacao/${neg.id}`}
                className="block bg-white rounded-xl border border-slate-200/60 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {neg.veiculo_foto ? (
                      <img
                        src={neg.veiculo_foto}
                        alt={`${neg.veiculo_marca} ${neg.veiculo_modelo}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-7 h-7 text-zinc-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 truncate">
                        {neg.veiculo_marca} {neg.veiculo_modelo}
                      </span>
                      <span className="text-xs text-slate-500">
                        {neg.veiculo_ano}
                      </span>
                    </div>
                    <p className="text-sm text-[#10b981] font-medium">
                      {formatPrice(neg.preco)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {neg.consultor_nome && (
                        <span>Consultor: {neg.consultor_nome}</span>
                      )}
                      <span>
                        {new Date(neg.created_at).toLocaleDateString("pt-AO")}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 ${
                      statusColors[neg.status] || "bg-zinc-800 text-slate-500"
                    }`}
                  >
                    {statusLabels[neg.status] || neg.status}
                  </span>

                  <svg
                    className="w-4 h-4 text-slate-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
