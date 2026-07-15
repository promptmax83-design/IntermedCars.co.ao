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
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-zinc-400">A carregar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard do Consultor</h1>
          <p className="text-sm text-zinc-400">
            Gestao das suas negociacoes e desempenho.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5">
              <p className="text-2xl font-bold text-[#10b981]">
                {stats.negociacoes_ativas}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Negociacoes Ativas</p>
            </div>
            <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5">
              <p className="text-2xl font-bold text-[#f59e0b]">
                {stats.rating?.toFixed(1) || "0.0"}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Rating</p>
            </div>
            <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5">
              <p className="text-2xl font-bold text-white">
                #{stats.ranking || "-"}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Ranking</p>
            </div>
            <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5">
              <p className="text-2xl font-bold text-blue-400">
                {stats.total_concluidas}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Concluidas</p>
            </div>
            <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5">
              <p className="text-2xl font-bold text-[#10b981]">
                Kz{(stats.comissao_total || 0).toLocaleString()}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Comissao Total</p>
            </div>
          </div>
        )}

        <div className="bg-[#0d0d0d] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-white">Negociacoes Pendentes</h2>
            <Link
              href="/negociacoes"
              className="text-xs text-[#10b981] hover:text-[#0ea573] transition-colors"
            >
              Ver todas
            </Link>
          </div>

          {negotiations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Nenhuma negociacao pendente no momento.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {negotiations.map((neg) => (
                <div
                  key={neg.id}
                  className="p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/negociacao/${neg.id}`}
                          className="font-semibold text-white hover:text-[#10b981] transition-colors truncate"
                        >
                          {neg.veiculo_marca} {neg.veiculo_modelo}
                        </Link>
                        <span className="text-xs text-zinc-500">
                          {neg.veiculo_ano}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span>
                          Vendedor: {neg.vendedor_nome || "N/D"}
                        </span>
                        <span>Comprador: {neg.comprador_nome || "N/D"}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(neg.created_at).toLocaleDateString("pt-AO")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                          statusColors[neg.status] || "bg-zinc-800 text-zinc-400"
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
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-30"
                          >
                            Recusar
                          </button>
                        </div>
                      )}

                      <Link
                        href={`/negociacao/${neg.id}`}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-zinc-400"
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
