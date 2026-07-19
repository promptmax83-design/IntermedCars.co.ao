"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Pedido = {
  id: number;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: number;
  veiculo_local: string;
  utilizador_nome: string;
  distancia_km: number | null;
  mensagem: string | null;
  criado_em: string;
  estado: string;
};

type Tab = "pendentes" | "aceites" | "todas";

const estadoLabels: Record<string, string> = {
  pendente: "Pendente",
  aceite: "Aceite",
  recusada: "Recusada",
};

const estadoColors: Record<string, string> = {
  pendente: "bg-[#f59e0b]/10 text-[#f59e0b]",
  aceite: "bg-[#10b981]/10 text-[#10b981]",
  recusada: "bg-red-500/10 text-red-400",
};

export default function ConsultorPedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pendentes");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPedidos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/solicitacoes/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data || json || [];
        setPedidos(Array.isArray(items) ? items : []);
      }
    } catch {
      // silent
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
    fetchPedidos();
  }, [router, fetchPedidos]);

  const handleAceitar = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/solicitacoes/${id}/aceitar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPedidos();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecusar = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/solicitacoes/${id}/recusar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPedidos();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = pedidos.filter((p) => {
    if (activeTab === "pendentes") return p.estado === "pendente";
    if (activeTab === "aceites") return p.estado === "aceite";
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--imc-verde-terra)] border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400">A carregar pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <p className="text-sm text-slate-500">
          Solicitacoes de intermediacao recebidas
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(["pendentes", "aceites", "todas"] as Tab[]).map((tab) => {
          const label = tab === "pendentes" ? "Pendentes" : tab === "aceites" ? "Aceites" : "Todas";
          const count =
            tab === "pendentes"
              ? pedidos.filter((p) => p.estado === "pendente").length
              : tab === "aceites"
                ? pedidos.filter((p) => p.estado === "aceite").length
                : pedidos.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-[11px] ${
                    activeTab === tab ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center">
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
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-800">
            Nenhum pedido {activeTab === "pendentes" ? "pendente" : activeTab === "aceites" ? "aceite" : ""}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === "pendentes"
              ? "Novos pedidos de intermediacao aparecerao aqui."
              : activeTab === "aceites"
                ? "Pedidos aceites aparecerao aqui."
                : "Pedidos aparecerao aqui quando forem recebidos."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-2xl border border-[rgba(201,155,62,0.4)] p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        estadoColors[pedido.estado] || "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {estadoLabels[pedido.estado] || pedido.estado}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(pedido.criado_em).toLocaleDateString("pt-AO")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800">
                    {pedido.veiculo_marca} {pedido.veiculo_modelo}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {pedido.veiculo_ano}{" "}
                    {pedido.veiculo_local ? `· ${pedido.veiculo_local}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>{pedido.utilizador_nome}</span>
                    {pedido.distancia_km != null && (
                      <span>{pedido.distancia_km.toFixed(1)} km</span>
                    )}
                  </div>
                  {pedido.mensagem && (
                    <p className="text-xs text-slate-400 mt-2 italic">
                      &ldquo;{pedido.mensagem}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {pedido.estado === "pendente" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAceitar(pedido.id)}
                    disabled={actionLoading === pedido.id}
                    className="flex-1 px-4 py-2.5 bg-[var(--imc-verde-terra)] hover:bg-[var(--imc-verde-terra)]/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading === pedido.id ? "A aceitar..." : "Aceitar"}
                  </button>
                  <button
                    onClick={() => handleRecusar(pedido.id)}
                    disabled={actionLoading === pedido.id}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading === pedido.id ? "A recusar..." : "Recusar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
