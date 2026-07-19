"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type CarteiraData = {
  saldo_total: number;
  ganhos_mes: number;
  pendente_recebimento: number;
  total_historico: number;
};

type Transacao = {
  id: number;
  tipo: string;
  valor: number;
  descricao: string;
  data: string;
};

export default function ConsultorCarteiraPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [carteira, setCarteira] = useState<CarteiraData>({
    saldo_total: 0,
    ganhos_mes: 0,
    pendente_recebimento: 0,
    total_historico: 0,
  });
  const [transacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, authLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/consultants/me/cofre`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const c = data.data || data;
        setCarteira({
          saldo_total: c.ganhos_totais || 0,
          ganhos_mes: c.ganhos_mes || 0,
          pendente_recebimento: c.ganhos_pendentes || 0,
          total_historico: c.ganhos_totais || 0,
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, fetchData]);

  if (authLoading || !isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Carteira</h1>
        <p className="text-sm text-slate-500">
          Gestao financeira e comissoes
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-80 mb-1">Saldo Total</p>
        {loading ? (
          <div className="h-9 w-32 bg-white/20 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-bold">
            Kz {carteira.saldo_total.toLocaleString("pt-AO")}
          </p>
        )}
        <p className="text-xs opacity-60 mt-2">Saldo disponivel para levantamento</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/60">
          <p className="text-lg font-bold text-[#10b981]">
            Kz {carteira.ganhos_mes.toLocaleString("pt-AO")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Ganhos do Mes</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/60">
          <p className="text-lg font-bold text-[#f59e0b]">
            Kz {carteira.pendente_recebimento.toLocaleString("pt-AO")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pendente</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/60">
          <p className="text-lg font-bold text-slate-800">
            Kz {carteira.total_historico.toLocaleString("pt-AO")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Historico</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="p-4 border-b border-slate-200/60">
          <h2 className="font-bold text-slate-800">Transacoes Recentes</h2>
        </div>

        {transacoes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Nenhuma transacao registada
            </p>
            <p className="text-xs text-slate-500 mt-1">
              As suas transacoes aparecerao aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transacoes.map((t) => (
              <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {t.descricao}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.tipo} · {new Date(t.data).toLocaleDateString("pt-AO")}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      t.valor >= 0 ? "text-[#10b981]" : "text-red-500"
                    }`}
                  >
                    {t.valor >= 0 ? "+" : ""} Kz{" "}
                    {Math.abs(t.valor).toLocaleString("pt-AO")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        disabled
        className="w-full py-3 bg-slate-100 text-slate-400 text-sm font-semibold rounded-xl cursor-not-allowed"
      >
        Levantar Fundos (Em breve)
      </button>
    </div>
  );
}
