"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const periodos = ["Hoje", "Esta Semana", "Este Mes", "Este Ano"];

type Transaction = {
  id: number;
  vehicle_id: number;
  buyer_id: number;
  seller_id: number;
  proposed_price: number;
  status: string;
  marca: string;
  modelo: string;
  created_at: string;
};

type Negotiation = {
  id: number;
  vehicle_id: number;
  proposed_price: number;
  status: string;
  created_at: string;
};

function formatKz(value: number): string {
  return "Kz" + value.toLocaleString("pt-AO");
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return months[d.getMonth()] || "";
}

function getLast6Months(): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    months.push(months[d.getMonth()]);
  }
  return months;
}

export default function DashboardFinanceiroPage() {
  const [periodo, setPeriodo] = useState("Hoje");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Sessao expirada");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [txRes, negRes] = await Promise.all([
          fetch(`${API_BASE}/api/transactions`, { headers }),
          fetch(`${API_BASE}/api/negotiations/user`, { headers }),
        ]);

        if (!txRes.ok) throw new Error("Erro ao carregar transacoes");

        const txData = await txRes.json();
        const negData = negRes.ok ? await negRes.json() : [];

        setTransactions(Array.isArray(txData) ? txData : []);
        setNegotiations(Array.isArray(negData) ? negData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedTransactions = transactions.filter((t) => t.status === "transacao_concluida");
  const pendingTransactions = transactions.filter((t) =>
    ["deposito_efetuado", "vistoria_concluida", "comissao_pendente"].includes(t.status)
  );

  const totalGanho = completedTransactions.reduce((sum, t) => sum + t.proposed_price, 0);
  const totalPendente = pendingTransactions.reduce((sum, t) => sum + t.proposed_price, 0);
  const comissaoPaga = completedTransactions.length * 100000;
  const negociosAtivos = pendingTransactions.length;

  const summaryCards = [
    { valor: formatKz(totalGanho), label: "Total Ganho", cor: "text-[#10b981]" },
    { valor: formatKz(totalPendente), label: "Em Escrow", cor: "text-blue-500" },
    { valor: formatKz(comissaoPaga), label: "Comissao Paga", cor: "text-[#c9a84c]" },
    { valor: String(negociosAtivos), label: "Negocios Ativos", cor: "text-[#c9a84c]" },
  ];

  // Build chart data from last 6 months
  const now = new Date();
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const chartMonths: { label: string; value: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();

    const monthTotal = completedTransactions
      .filter((t) => {
        const td = new Date(t.created_at);
        return td.getMonth() === m && td.getFullYear() === y;
      })
      .reduce((sum, t) => sum + t.proposed_price, 0);

    chartMonths.push({ label: monthNames[m], value: monthTotal });
  }

  const maxChartValue = Math.max(...chartMonths.map((c) => c.value), 1);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getTransactionType = (status: string): "receita" | "escrow" | "despesa" => {
    if (status === "transacao_concluida") return "receita";
    if (["deposito_efetuado", "vistoria_concluida", "comissao_pendente"].includes(status)) return "escrow";
    return "despesa";
  };

  const formatTransactionDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#060608]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Dashboard Financeiro</h1>
          <p className="text-sm text-[#71717a]">Visao geral das suas financas.</p>
        </div>

        <div className="flex gap-2">
          {periodos.map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                p === periodo
                  ? "bg-[#10b981] text-[#060608] font-semibold"
                  : "bg-white/[0.04] text-[#71717a] border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-zinc-900/50 rounded-2xl p-12 text-center border border-zinc-800/80">
            <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#71717a] text-sm">A carregar dados financeiros...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-zinc-900/50 rounded-2xl p-12 text-center border border-zinc-800/80">
            <p className="text-[#ef4444] text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {summaryCards.map((r) => (
                <div
                  key={r.label}
                  className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/80"
                >
                  <p className={`text-2xl font-bold ${r.cor}`}>{r.valor}</p>
                  <p className="text-xs text-[#71717a] mt-1">{r.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800/80">
              <h2 className="font-bold text-[#fafafa] mb-4">Grafico de Receitas</h2>
              <div className="flex items-end gap-2 h-40">
                {chartMonths.map((m, i) => {
                  const heightPercent = m.value > 0 ? (m.value / maxChartValue) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-[#10b981]/20 rounded-t"
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      >
                        <div
                          className="w-full bg-[#10b981] rounded-t"
                          style={{ height: "100%" }}
                        />
                      </div>
                      <span className="text-[10px] text-[#71717a]">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/80 overflow-hidden">
              <div className="p-4 border-b border-zinc-800/80">
                <h2 className="font-bold text-[#fafafa]">Transacoes Recentes</h2>
              </div>
              <div className="divide-y divide-zinc-800/80">
                {recentTransactions.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[#71717a] text-sm">Sem transacoes.</p>
                  </div>
                ) : (
                  recentTransactions.map((t) => {
                    const tipo = getTransactionType(t.status);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#fafafa]">
                            {t.marca} {t.modelo}
                          </p>
                          <p className="text-xs text-[#71717a]">
                            {formatTransactionDate(t.created_at)}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            tipo === "receita"
                              ? "text-[#10b981]"
                              : tipo === "escrow"
                                ? "text-blue-500"
                                : "text-red-500"
                          }`}
                        >
                          {tipo === "receita" ? "+" : ""}
                          {formatKz(t.proposed_price)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
