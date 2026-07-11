"use client";
import { useState } from "react";

const negociacoes = [
  {
    id: "#1247",
    veiculo: "BMW Serie 5",
    valor: "41.500€",
    estado: "Contrato Pendente",
    cor: "text-amber-500",
    bg: "bg-amber-50",
    comprador: "João F.",
    vendedor: "Ana R.",
  },
  {
    id: "#1246",
    veiculo: "Porsche Macan",
    valor: "67.000€",
    estado: "Transferência",
    cor: "text-blue-500",
    bg: "bg-blue-50",
    comprador: "Pedro S.",
    vendedor: "Carlos M.",
  },
  {
    id: "#1245",
    veiculo: "Audi Q5",
    valor: "48.500€",
    estado: "Entrega",
    cor: "text-emerald-500",
    bg: "bg-emerald-50",
    comprador: "Maria S.",
    vendedor: "Ana S.",
  },
  {
    id: "#1240",
    veiculo: "Tesla Model 3",
    valor: "43.000€",
    estado: "Concluído",
    cor: "text-green-600",
    bg: "bg-green-50",
    comprador: "Pedro M.",
    vendedor: "EcoCars",
  },
];

const pendencias = [
  {
    tipo: "Documento",
    descricao: "Contrato #1247 aguarda assinatura do vendedor",
    urgente: true,
  },
  {
    tipo: "Pagamento",
    descricao: "Comissão de #1240 pendente de processamento",
    urgente: false,
  },
  {
    tipo: "Vistoria",
    descricao: "Vistoria do Tesla Model 3 #1240 concluída",
    urgente: false,
  },
];

export default function MediadorPage() {
  const [tab, setTab] = useState("negociações");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel do Mediador</h1>
        <p className="text-sm text-muted">
          Gira todas as suas mediações em um só lugar.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          "negociações",
          "documentos",
          "chat",
          "contratos",
          "pendências",
          "transferências",
        ].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-medium shrink-0 capitalize transition-colors ${t === tab ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "negociações" && (
        <div className="space-y-3">
          {negociacoes.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{n.id}</span>
                  <span className="text-muted text-sm">·</span>
                  <span className="text-sm">{n.veiculo}</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${n.bg} ${n.cor}`}
                >
                  {n.estado}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  {n.comprador} → {n.vendedor}
                </span>
                <span className="font-bold text-accent">{n.valor}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "pendências" && (
        <div className="space-y-3">
          {pendencias.map((p, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl p-4 shadow-sm border ${p.urgente ? "border-amber-300" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {p.urgente && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Urgente
                  </span>
                )}
                <span className="text-xs text-muted">{p.tipo}</span>
              </div>
              <p className="text-sm">{p.descricao}</p>
            </div>
          ))}
        </div>
      )}

      {tab !== "negociações" && tab !== "pendências" && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-muted">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm">Secção {tab} em construção</p>
        </div>
      )}
    </div>
  );
}
