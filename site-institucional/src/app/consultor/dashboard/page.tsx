"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ConsultorStats = {
  negociacoes_ativas: number;
  rating: number;
  ranking: number;
  zona: string;
  total_concluidas: number;
  comissao_total: number;
};

type Negotiation = {
  id: number;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: number;
  preco: number;
  status: string;
  comprador_nome: string;
  vendedor_nome: string;
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

export default function ConsultorDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ConsultorStats | null>(null);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [statsRes, negRes] = await Promise.all([
        fetch(`${API_BASE}/api/consultants/me/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/negotiations/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData);
      }

      if (negRes.ok) {
        const negData = await negRes.json();
        const allNeg = negData.data || negData;
        setNegotiations(
          Array.isArray(allNeg)
            ? allNeg.filter((n: Negotiation) =>
                ["pendente", "aceite", "em_negociacao"].includes(n.status)
              )
            : []
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
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
    fetchData();
  }, [router, fetchData]);

  const handleAccept = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/negotiations/${id}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      fetchData();
    } catch {
      // silent
    }
    setActionLoading(null);
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/negotiations/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      fetchData();
    } catch {
      // silent
    }
    setActionLoading(null);
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
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard do Consultor</h1>
          <p className="text-sm text-slate-500">
            Gestao das suas negociacoes e desempenho.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <p className="text-2xl font-bold text-[#10b981]">
                {stats.negociacoes_ativas}
              </p>
              <p className="text-xs text-slate-500 mt-1">Negociacoes Ativas</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <p className="text-2xl font-bold text-[#f59e0b]">
                {stats.rating?.toFixed(1) || "0.0"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Rating</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <p className="text-2xl font-bold text-slate-800">
                #{stats.ranking || "-"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Ranking</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <p className="text-2xl font-bold text-blue-400">
                {stats.total_concluidas}
              </p>
              <p className="text-xs text-slate-500 mt-1">Concluidas</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200/60">
              <p className="text-2xl font-bold text-[#10b981]">
                Kz{(stats.comissao_total || 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">Comissao Total</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Negociacoes Pendentes</h2>
            <Link
              href="/negociacoes"
              className="text-xs text-[#10b981] hover:text-[#0ea573] transition-colors"
            >
              Ver todas
            </Link>
          </div>

          {negotiations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhuma negociacao pendente no momento.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {negotiations.map((neg) => (
                <div
                  key={neg.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/negociacao/${neg.id}`}
                          className="font-semibold text-slate-800 hover:text-[#10b981] transition-colors truncate"
                        >
                          {neg.veiculo_marca} {neg.veiculo_modelo}
                        </Link>
                        <span className="text-xs text-slate-500">
                          {neg.veiculo_ano}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          Vendedor: {neg.vendedor_nome || "N/D"}
                        </span>
                        <span>Comprador: {neg.comprador_nome || "N/D"}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(neg.created_at).toLocaleDateString("pt-AO")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                          statusColors[neg.status] || "bg-zinc-800 text-slate-500"
                        }`}
                      >
                        {statusLabels[neg.status] || neg.status}
                      </span>

                      {neg.status === "pendente" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAccept(neg.id)}
                            disabled={actionLoading === neg.id}
                            className="px-3 py-1.5 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] text-xs font-semibold rounded-lg transition-colors disabled:opacity-30"
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={() => handleReject(neg.id)}
                            disabled={actionLoading === neg.id}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-100 text-slate-500 text-xs font-medium rounded-lg transition-colors disabled:opacity-30"
                          >
                            Recusar
                          </button>
                        </div>
                      )}

                      <Link
                        href={`/negociacao/${neg.id}`}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-slate-500"
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
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
