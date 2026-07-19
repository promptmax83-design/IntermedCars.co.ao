"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import DashboardMetrics from "@/components/consultant/DashboardMetrics";
import PendingRequestCard from "@/components/consultant/PendingRequestCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type CofreData = {
  ganhos_totais: number;
  ganhos_pendentes: number;
  negocios_concluidos: number;
  ranking: string;
  split_percentagem: number;
  proximo_ranking: string;
  progresso_percentagem: number;
};

type PendingRequest = {
  id: number;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: number;
  veiculo_local: string;
  utilizador_nome: string;
  distancia_km: number | null;
  mensagem: string | null;
  criado_em: string;
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

const rankingBadge: Record<string, string> = {
  Bronze: "bg-amber-100 text-amber-700",
  Prata: "bg-slate-100 text-slate-600",
  Ouro: "bg-yellow-100 text-yellow-700",
  Embaixador: "bg-amber-100 text-amber-800",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function ConsultorPainelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cofre, setCofre] = useState<CofreData | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<PendingRequest[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [cofreRes, solRes, negRes] = await Promise.all([
        fetch(`${API_BASE}/api/consultants/me/cofre`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/solicitacoes/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/negotiations/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (cofreRes.ok) {
        const d = await cofreRes.json();
        setCofre(d.data || d);
      }

      if (solRes.ok) {
        const d = await solRes.json();
        const all = d.data || d;
        setSolicitacoes(
          Array.isArray(all)
            ? all.filter((s: PendingRequest & { estado?: string }) => s.estado === "pendente")
            : []
        );
      }

      if (negRes.ok) {
        const d = await negRes.json();
        const all = d.data || d;
        setNegotiations(
          Array.isArray(all)
            ? all.filter((n: Negotiation) =>
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

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center">
        <div className="text-slate-500">A carregar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const cofreData: CofreData = cofre || {
    ganhos_totais: 0,
    ganhos_pendentes: 0,
    negocios_concluidos: 0,
    ranking: "Bronze",
    split_percentagem: 20,
    proximo_ranking: "Prata",
    progresso_percentagem: 0,
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel</h1>
        <p className="text-sm text-slate-500">
          {getGreeting()}, {user?.nome || "Consultor"}!
        </p>
      </div>

      {user?.id && <DashboardMetrics consultantId={user.id} />}

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h2 className="text-lg font-bold text-amber-900">O Meu Cofre</h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              rankingBadge[cofreData.ranking] || "bg-amber-100 text-amber-700"
            }`}
          >
            {cofreData.ranking}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-3xl font-bold text-amber-900">
            Kz {cofreData.ganhos_totais.toLocaleString("pt-AO")}
          </p>
          <p className="text-sm text-amber-600">Ganhos Totais</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-700">
              {cofreData.split_percentagem}%
            </p>
            <p className="text-xs text-amber-600">Split</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-700">
              {cofreData.negocios_concluidos}
            </p>
            <p className="text-xs text-amber-600">Negocios</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-700">
              Kz {cofreData.ganhos_pendentes.toLocaleString("pt-AO")}
            </p>
            <p className="text-xs text-amber-600">Pendente</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-amber-700 mb-1">
            <span>Progresso</span>
            <span>Proximo nivel: {cofreData.proximo_ranking}</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all"
              style={{ width: `${cofreData.progresso_percentagem}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">Pedidos Pendentes</h2>
          {solicitacoes.length > 0 && (
            <span className="text-xs text-slate-500">
              {solicitacoes.length} pedido{solicitacoes.length !== 1 && "s"}
            </span>
          )}
        </div>

        {solicitacoes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/60 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-7 h-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Nenhum pedido pendente
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Novos pedidos aparecerao aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {solicitacoes.map((req) => (
              <PendingRequestCard
                key={req.id}
                request={req}
                onAccepted={() =>
                  setSolicitacoes((prev) => prev.filter((r) => r.id !== req.id))
                }
                onRejected={() =>
                  setSolicitacoes((prev) => prev.filter((r) => r.id !== req.id))
                }
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">Negociacoes Ativas</h2>
          {negotiations.length > 0 && (
            <span className="text-xs text-slate-500">
              {negotiations.length} negociacao{negotiations.length !== 1 && "es"}
            </span>
          )}
        </div>

        {negotiations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/60 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-7 h-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Nenhuma negociacao ativa
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Negociacoes ativas aparecerao aqui.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <div className="divide-y divide-white/5">
              {negotiations.map((neg) => (
                <div
                  key={neg.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 truncate">
                          {neg.veiculo_marca} {neg.veiculo_modelo}
                        </span>
                        <span className="text-xs text-slate-500">
                          {neg.veiculo_ano}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Vendedor: {neg.vendedor_nome || "N/D"}</span>
                        <span>Comprador: {neg.comprador_nome || "N/D"}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(neg.created_at).toLocaleDateString("pt-AO")}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 ${
                        statusColors[neg.status] || "bg-zinc-800 text-slate-500"
                      }`}
                    >
                      {statusLabels[neg.status] || neg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
