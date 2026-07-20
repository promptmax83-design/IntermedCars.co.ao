"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Negotiation = {
  id: number;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: number;
  preco: number;
  status: string;
  consultor_id: number;
  consultor_nome: string;
  comprador_id: number;
  comprador_nome: string;
  vendedor_id: number;
  vendedor_nome: string;
  created_at: string;
};

type FinancialSummary = {
  comissao_vendedor: number;
  comissao_comprador: number;
  total_taxas: number;
  preco_final: number;
};

const timelineSteps = [
  { key: "pendente", label: "Pendente", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "aceite", label: "Aceite", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "em_negociacao", label: "Negociacao", icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
  { key: "vistoria", label: "Vistoria", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
  { key: "concluida", label: "Concluida", icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" },
];

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

function decodeUserId(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.sub === "number" ? payload.sub : null;
  } catch {
    return null;
  }
}

export default function NegociacaoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const fetchNegotiation = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [negRes, finRes] = await Promise.all([
        fetch(`${API_BASE}/api/negotiations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/negotiations/${id}/financial`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (negRes.ok) {
        const data = await negRes.json();
        setNegotiation(data.data || data);
      } else {
        throw new Error("Negociacao nao encontrada");
      }

      if (finRes.ok) {
        const data = await finRes.json();
        setFinancial(data.data || data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const uid = decodeUserId(token);
    startTransition(() => { setCurrentUserId(uid); });
    startTransition(() => { fetchNegotiation(); });
  }, [router, id, fetchNegotiation]);

  const performAction = async (action: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/negotiations/${id}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      fetchNegotiation();
    } catch {
      alert("Erro ao executar acao. Tente novamente.");
    } finally {
      setActionLoading(false);
    }
  };

  const getTimelineIndex = (status: string) => {
    const idx = timelineSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const getRole = () => {
    if (!negotiation || !currentUserId) return null;
    if (currentUserId === negotiation.consultor_id) return "consultor";
    if (currentUserId === negotiation.vendedor_id) return "vendedor";
    if (currentUserId === negotiation.comprador_id) return "comprador";
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">A carregar negociacao...</p>
        </div>
      </div>
    );
  }

  if (error || !negotiation) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error || "Negociacao nao encontrada"}</p>
          <Link
            href="/negociacoes"
            className="text-sm text-[#10b981] hover:text-[#0ea573] transition-colors"
          >
            Voltar as negociacoes
          </Link>
        </div>
      </div>
    );
  }

  const role = getRole();
  const currentStep = getTimelineIndex(negotiation.status);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/negociacoes"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {negotiation.veiculo_marca} {negotiation.veiculo_modelo}
            </h1>
            <p className="text-sm text-slate-500">
              Negociacao #{negotiation.id} &middot; {negotiation.veiculo_ano}
            </p>
          </div>
          <span
            className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusColors[negotiation.status] || "bg-zinc-800 text-slate-500"
            }`}
          >
            {statusLabels[negotiation.status] || negotiation.status}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Estado da Negociacao</h2>
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      i <= currentStep
                        ? "bg-[#10b981]/20 text-[#10b981]"
                        : "bg-slate-100 text-zinc-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={step.icon}
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 ${
                      i <= currentStep ? "text-[#10b981]" : "text-zinc-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-5 ${
                      i < currentStep ? "bg-[#10b981]" : "bg-slate-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Veiculo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Marca/Modelo</span>
                <span className="text-slate-800 font-medium">
                  {negotiation.veiculo_marca} {negotiation.veiculo_modelo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ano</span>
                <span className="text-slate-800">{negotiation.veiculo_ano}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preco</span>
                <span className="text-[#10b981] font-bold">
                  Kz{negotiation.preco.toLocaleString("pt-AO")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Partes Envolvidas</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendedor</span>
                <span className="text-slate-800">{negotiation.vendedor_nome || "N/D"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comprador</span>
                <span className="text-slate-800">{negotiation.comprador_nome || "N/D"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultor</span>
                <span className="text-slate-800">{negotiation.consultor_nome || "N/D"}</span>
              </div>
            </div>
          </div>
        </div>

        {financial && (
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Resumo Financeiro</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Preco Final</p>
                <p className="text-lg font-bold text-slate-800">
                  Kz{(financial.preco_final || negotiation.preco).toLocaleString("pt-AO")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Comissao Vendedor (5%)</p>
                <p className="text-lg font-bold text-[#f59e0b]">
                  Kz{(financial.comissao_vendedor || 0).toLocaleString("pt-AO")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Comissao Comprador (3%)</p>
                <p className="text-lg font-bold text-blue-400">
                  Kz{(financial.comissao_comprador || 0).toLocaleString("pt-AO")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Taxas</p>
                <p className="text-lg font-bold text-[#10b981]">
                  Kz{(financial.total_taxas || 0).toLocaleString("pt-AO")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200/60 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Accoes</h2>
          <div className="flex flex-wrap gap-3">
            {role === "consultor" && (
              <>
                {negotiation.status === "em_negociacao" && (
                  <button
                    onClick={() => performAction("inspection")}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-30"
                  >
                    Submeter Vistoria
                  </button>
                )}
                {negotiation.status === "vistoria" && (
                  <button
                    onClick={() => performAction("close")}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-[#10b981] text-[#060608] text-sm font-semibold rounded-lg hover:bg-[#0ea573] transition-colors disabled:opacity-30"
                  >
                    Fechar Negocio
                  </button>
                )}
              </>
            )}

            {role === "vendedor" && (
              <>
                {negotiation.status === "concluida" && (
                  <button
                    onClick={() => performAction("confirm-payment")}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-[#10b981] text-[#060608] text-sm font-semibold rounded-lg hover:bg-[#0ea573] transition-colors disabled:opacity-30"
                  >
                    Confirmar Pagamento
                  </button>
                )}
                {negotiation.status === "concluida" && (
                  <button
                    onClick={() => performAction("deliver")}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-30"
                  >
                    Entregar Veiculo
                  </button>
                )}
              </>
            )}

            {role === "comprador" && (
              <>
                {negotiation.status === "concluida" && (
                  <button
                    onClick={() => performAction("confirm-payment")}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-[#10b981] text-[#060608] text-sm font-semibold rounded-lg hover:bg-[#0ea573] transition-colors disabled:opacity-30"
                  >
                    Confirmar Pagamento
                  </button>
                )}
              </>
            )}

            <Link
              href={`/chat?negotiation=${negotiation.id}`}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 border border-slate-200/60 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              Abrir Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
