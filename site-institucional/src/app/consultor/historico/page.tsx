"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

type Stats = {
  total_intermediacoes: number;
  ganhos_acumulados: number;
  avaliacao_media: number;
};

const statusColors: Record<string, string> = {
  concluida: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  concluida: "Concluida",
  cancelada: "Cancelada",
};

export default function ConsultorHistoricoPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_intermediacoes: 0,
    ganhos_acumulados: 0,
    avaliacao_media: 0,
  });
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

      const [negRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/negotiations/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/consultants/me/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (negRes.ok) {
        const data = await negRes.json();
        const all: Negotiation[] = data.data || data || [];
        const completed = all.filter((n) =>
          ["concluida", "cancelada"].includes(n.status)
        );
        setNegotiations(completed);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        const s = data.data || data;
        setStats({
          total_intermediacoes: s.total_concluidas || 0,
          ganhos_acumulados: s.comissao_total || 0,
          avaliacao_media: s.rating || 0,
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
        <h1 className="text-2xl font-bold text-slate-800">Historico</h1>
        <p className="text-sm text-slate-500">
          Actividade anterior como intermediario
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/60">
          <p className="text-2xl font-bold text-[#10b981]">
            {stats.total_intermediacoes}
          </p>
          <p className="text-xs text-slate-500 mt-1">Intermediacoes</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/60">
          <p className="text-2xl font-bold text-[#c9a84c]">
            Kz {stats.ganhos_acumulados.toLocaleString("pt-AO")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Ganhos Acumulados</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/60">
          <p className="text-2xl font-bold text-slate-800">
            {stats.avaliacao_media.toFixed(1)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Avaliacao Media</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        <div className="p-4 border-b border-slate-200/60">
          <h2 className="font-bold text-slate-800">Negociacoes Passadas</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">A carregar historico...</p>
          </div>
        ) : negotiations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Nenhuma negociacao registada
            </p>
            <p className="text-xs text-slate-500 mt-1">
              As suas negociacoes concluidas aparecerao aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {negotiations.map((neg) => (
              <Link
                key={neg.id}
                href={`/negociacao/${neg.id}`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {neg.veiculo_marca} {neg.veiculo_modelo}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{neg.veiculo_ano}</span>
                      <span>Vendedor: {neg.vendedor_nome || "N/D"}</span>
                      <span>Comprador: {neg.comprador_nome || "N/D"}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(neg.created_at).toLocaleDateString("pt-AO")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                        statusColors[neg.status] || "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {statusLabels[neg.status] || neg.status}
                    </span>
                    <p className="text-sm font-bold text-[#10b981] mt-2">
                      Kz {(neg.preco || 0).toLocaleString("pt-AO")}
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
