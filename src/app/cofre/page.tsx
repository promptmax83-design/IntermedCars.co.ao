"use client";
import { useState } from "react";

const negociacoes = [
  {
    id: 1,
    veiculo: "BMW Serie 5 530e",
    valor: "41.500€",
    comprador: "João Ferreira",
    vendedor: "Ana Rodrigues",
    agente: "Miguel Costa",
    prazo: "15 Jul 2026",
    etapas: [
      { nome: "Reserva paga", status: "concluido", data: "08/07 10:15" },
      { nome: "Documentação", status: "concluido", data: "09/07 14:30" },
      { nome: "Verificação", status: "concluido", data: "10/07 09:00" },
      { nome: "Contrato", status: "ativo", data: "Aguardando assinatura" },
      { nome: "Transferência", status: "pendente", data: "" },
      { nome: "Entrega", status: "pendente", data: "" },
      { nome: "Comissão", status: "pendente", data: "" },
      { nome: "Concluído", status: "pendente", data: "" },
    ],
  },
  {
    id: 2,
    veiculo: "Porsche Macan S",
    valor: "67.000€",
    comprador: "Pedro Santos",
    vendedor: "Carlos Mendes",
    agente: "Ana Rodrigues",
    prazo: "20 Jul 2026",
    etapas: [
      { nome: "Reserva paga", status: "concluido", data: "05/07 11:00" },
      { nome: "Documentação", status: "concluido", data: "06/07 16:45" },
      { nome: "Verificação", status: "concluido", data: "07/07 10:30" },
      { nome: "Contrato", status: "concluido", data: "08/07 14:00" },
      { nome: "Transferência", status: "ativo", data: "Processando..." },
      { nome: "Entrega", status: "pendente", data: "" },
      { nome: "Comissão", status: "pendente", data: "" },
      { nome: "Concluído", status: "pendente", data: "" },
    ],
  },
  {
    id: 3,
    veiculo: "Audi Q5 40 TDI",
    valor: "48.500€",
    comprador: "Maria Silva",
    vendedor: "Ana S.",
    agente: "Carlos Mendes",
    prazo: "12 Jul 2026",
    etapas: [
      { nome: "Reserva paga", status: "concluido", data: "01/07 09:30" },
      { nome: "Documentação", status: "concluido", data: "02/07 11:00" },
      { nome: "Verificação", status: "concluido", data: "03/07 15:00" },
      { nome: "Contrato", status: "concluido", data: "04/07 10:00" },
      { nome: "Transferência", status: "concluido", data: "05/07 14:30" },
      { nome: "Entrega", status: "concluido", data: "06/07 11:00" },
      { nome: "Comissão", status: "concluido", data: "07/07 09:00" },
      { nome: "Concluído", status: "concluido", data: "07/07 09:00" },
    ],
  },
];

export default function CofrePage() {
  const [negociacaoAtiva, setNegociacaoAtiva] = useState(0);
  const neg = negociacoes[negociacaoAtiva];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cofre Fiduciário</h1>
        <p className="text-sm text-muted">Acompanhe o estado de cada negociação em tempo real.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {negociacoes.map((n, i) => (
          <button
            key={n.id}
            onClick={() => setNegociacaoAtiva(i)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              i === negociacaoAtiva ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {n.veiculo.split(" ")[0]} {n.veiculo.split(" ")[1]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-primary text-white p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400">Veículo</p>
              <p className="font-bold text-sm mt-1">{neg.veiculo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Valor</p>
              <p className="font-bold text-accent text-lg mt-1">{neg.valor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estado</p>
              <p className="font-bold text-sm mt-1 text-amber-400">
                {neg.etapas.find((e) => e.status === "ativo")?.nome || "Concluído"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Prazo</p>
              <p className="font-bold text-sm mt-1">{neg.prazo}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-400">Comprador</p>
              <p className="text-sm mt-1">{neg.comprador}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Vendedor</p>
              <p className="text-sm mt-1">{neg.vendedor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Agente / Mediador</p>
              <p className="text-sm mt-1">{neg.agente}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-bold mb-6">Progresso do Cofre</h3>
          <div className="space-y-0">
            {neg.etapas.map((etapa, i) => (
              <div key={etapa.nome} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    etapa.status === "concluido" ? "bg-emerald-500 text-white" :
                    etapa.status === "ativo" ? "bg-accent text-primary animate-pulse" :
                    "bg-gray-200 text-gray-400"
                  }`}>
                    {etapa.status === "concluido" ? "✓" : i + 1}
                  </div>
                  {i < neg.etapas.length - 1 && (
                    <div className={`w-0.5 h-12 ${
                      etapa.status === "concluido" ? "bg-emerald-300" : "bg-gray-200"
                    }`} />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium text-sm ${etapa.status === "concluido" ? "text-emerald-600" : etapa.status === "ativo" ? "text-accent font-bold" : "text-gray-400"}`}>
                      {etapa.nome}
                    </p>
                    {etapa.data && <span className="text-xs text-muted">{etapa.data}</span>}
                  </div>
                  {etapa.status === "ativo" && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-amber-700">{etapa.data}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-accent">3</p>
          <p className="text-sm text-muted mt-1">Negócios Ativos</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-emerald-500">157.000€</p>
          <p className="text-sm text-muted mt-1">Em Cofre</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-green-500">1</p>
          <p className="text-sm text-muted mt-1">Concluídos</p>
        </div>
      </div>
    </div>
  );
}
