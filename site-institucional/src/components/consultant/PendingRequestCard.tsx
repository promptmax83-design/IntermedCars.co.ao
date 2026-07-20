"use client";
import { useState, useEffect, useTransition } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

export default function PendingRequestCard({
  request,
  onAccepted,
  onRejected,
}: {
  request: PendingRequest;
  onAccepted: (id: number) => void;
  onRejected: (id: number) => void;
}) {
  const [loading, setLoading] = useState<"aceitar" | "recusar" | null>(null);
  const [minutesAgo, setMinutesAgo] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => { setMinutesAgo(Math.floor((Date.now() - new Date(request.criado_em).getTime()) / 60000)); });
  }, [request.criado_em]);

  const handleAceitar = async () => {
    setLoading("aceitar");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/solicitacoes/${request.id}/aceitar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onAccepted(request.id);
    } catch { /* silent */ } finally { setLoading(null); }
  };

  const handleRecusar = async () => {
    setLoading("recusar");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/solicitacoes/${request.id}/recusar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onRejected(request.id);
    } catch { /* silent */ } finally { setLoading(null); }
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(201,155,62,0.4)] p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[var(--imc-ouro)]/10 text-[var(--imc-ouro)] text-[10px] font-bold px-2 py-0.5 rounded-md">
              NOVO PEDIDO
            </span>
            <span className="text-[11px] text-slate-400">
              {minutesAgo < 1 ? "Agora" : `${minutesAgo}min atras`}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800">
            {request.veiculo_marca} {request.veiculo_modelo}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {request.veiculo_ano} · {request.veiculo_local || "Localizacao N/D"}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span>👤 {request.utilizador_nome}</span>
            {request.distancia_km != null && (
              <span>📍 {request.distancia_km.toFixed(1)} km do carro</span>
            )}
          </div>
          {request.mensagem && (
            <p className="text-xs text-slate-400 mt-2 italic">&ldquo;{request.mensagem}&rdquo;</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAceitar}
          disabled={loading !== null}
          className="flex-1 px-4 py-2.5 bg-[var(--imc-verde-terra)] hover:bg-[var(--imc-verde-terra)]/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading === "aceitar" ? "A aceitar..." : "Aceitar"}
        </button>
        <button
          onClick={handleRecusar}
          disabled={loading !== null}
          className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading === "recusar" ? "A recusar..." : "Recusar"}
        </button>
      </div>
    </div>
  );
}
