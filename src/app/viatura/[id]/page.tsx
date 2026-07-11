"use client";
import Link from "next/link";
import { useState } from "react";
import StatusBadge, { type VehicleStatus } from "@/components/status-badge";

const galeria = [
  "/placeholder1.jpg",
  "/placeholder2.jpg",
  "/placeholder3.jpg",
  "/placeholder4.jpg",
  "/placeholder5.jpg",
  "/placeholder6.jpg",
];

const viatura = {
  id: 1,
  marca: "BMW",
  modelo: "Serie 5 530e M Sport",
  ano: "2023",
  preco: "42.900.000",
  km: "15.000",
  combustivel: "Hibrido Plug-in",
  caixa: "Automatica 8 vel.",
  cor: "Preto Sapphire",
  potencia: "299 cv",
  tracao: "Traseira",
  portas: "5",
  lugares: "5",
  vendedor: "Carlos Mendes",
  vendedorVerificado: true,
  vendedorVendas: 12,
  local: "Luanda, Angola",
  status: "disponivel" as VehicleStatus,
  descricao:
    "BMW Serie 5 530e M Sport em excelente estado. Equipada com pacote M Sport, navegador profissional, teto solar panoramico, cameras 360 e assistente de estacionamento. Revisoes em dia na marca.",
};

const vistoria = [
  { item: "Motor", ok: true },
  { item: "Travoes", ok: true },
  { item: "Interior", ok: true },
  { item: "Pintura", ok: true },
  { item: "Pneus", ok: true },
  { item: "Suspensao", ok: true },
];

export default function ViaturaPage() {
  const [imagemAtual, setImagemAtual] = useState(0);
  const [favoritado, setFavoritado] = useState(false);

  const isDimmed =
    viatura.status === "comprado" || viatura.status === "cancelado";
  const isAvailable = viatura.status === "disponivel";
  const isNegotiating = viatura.status === "em_negociacao";

  return (
    <div
      className={`max-w-4xl mx-auto px-4 py-6 space-y-6 ${isDimmed ? "opacity-60" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
        >
          Voltar ao Feed
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge status={viatura.status} size="md" />
          <button
            onClick={() => setFavoritado(!favoritado)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              favoritado
                ? "bg-[#ef4444]/10 text-[#ef4444]"
                : "bg-white/[0.04] text-[#71717a] hover:text-[#fafafa]"
            }`}
          >
            {favoritado ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Sold/Cancelled Overlay */}
      {viatura.status === "comprado" && (
        <div className="glass-card rounded-xl p-6 text-center">
          <span className="px-6 py-3 bg-[#52525b]/30 text-[#a1a1aa] text-lg font-bold rounded-lg uppercase tracking-wider">
            Viatura Vendida
          </span>
          <p className="text-[#52525b] text-sm mt-2">
            Esta viatura ja foi vendida e nao esta disponivel.
          </p>
        </div>
      )}

      {viatura.status === "cancelado" && (
        <div className="glass-card rounded-xl p-6 text-center">
          <span className="px-6 py-3 bg-[#ef4444]/10 text-[#ef4444] text-lg font-bold rounded-lg uppercase tracking-wider border border-[#ef4444]/20">
            Anuncio Cancelado
          </span>
          <p className="text-[#52525b] text-sm mt-2">
            Este anuncio foi cancelado pelo vendedor.
          </p>
        </div>
      )}

      {/* Galeria */}
      <div className="bg-gradient-to-br from-[#0d0d10] to-[#121215] rounded-xl overflow-hidden border border-white/[0.04]">
        <div className="h-72 flex items-center justify-center relative">
          <span className="text-8xl text-[#27272a] font-bold">
            {viatura.marca[0]}
          </span>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {galeria.map((_, i) => (
              <button
                key={i}
                onClick={() => setImagemAtual(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === imagemAtual ? "bg-[#10b981]" : "bg-[#52525b]"}`}
              />
            ))}
          </div>
          <span className="absolute top-3 left-3 bg-[#060608]/60 text-[#fafafa] text-xs px-2 py-1 rounded-full">
            {imagemAtual + 1}/{galeria.length}
          </span>
        </div>
        <div className="flex gap-1 p-2 overflow-x-auto">
          {galeria.map((_, i) => (
            <button
              key={i}
              onClick={() => setImagemAtual(i)}
              className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors ${
                i === imagemAtual
                  ? "border-[#10b981]"
                  : "border-transparent bg-white/[0.03]"
              }`}
            >
              <span className="text-[#52525b] text-sm">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Principal */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[#10b981] text-sm font-semibold">
              {viatura.marca}
            </p>
            <h1 className="text-2xl font-bold text-[#fafafa]">
              {viatura.modelo}
            </h1>
            <p className="text-[#71717a] text-sm mt-1">
              {viatura.local} - Publicado ha 3 dias
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#10b981]">
              Kz {viatura.preco}
            </p>
            <p className="text-xs text-[#52525b]">IVA incluido</p>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Ano", value: viatura.ano },
            { label: "Km", value: viatura.km },
            { label: "Combustivel", value: viatura.combustivel },
            { label: "Caixa", value: viatura.caixa },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/[0.03] rounded-lg p-3 text-center"
            >
              <p className="text-[10px] text-[#71717a] uppercase">
                {item.label}
              </p>
              <p className="text-sm font-bold text-[#fafafa] mt-0.5">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Cor", value: viatura.cor },
            { label: "Potencia", value: viatura.potencia },
            { label: "Tracao", value: viatura.tracao },
            { label: "Lugares", value: viatura.lugares },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/[0.03] rounded-lg p-3 text-center"
            >
              <p className="text-[10px] text-[#71717a] uppercase">
                {item.label}
              </p>
              <p className="text-sm font-bold text-[#fafafa] mt-0.5">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[#a1a1aa] text-sm leading-relaxed">
          {viatura.descricao}
        </p>
      </div>

      {/* Vendedor */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-bold text-[#fafafa] mb-4">Vendedor</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b8933d] flex items-center justify-center text-[#060608] font-bold">
            {viatura.vendedor
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-[#fafafa]">{viatura.vendedor}</p>
              {viatura.vendedorVerificado && (
                <span className="text-[#10b981] text-xs font-medium">
                  Verificado
                </span>
              )}
            </div>
            <p className="text-xs text-[#71717a]">
              {viatura.vendedorVendas} vendas realizadas
            </p>
          </div>
        </div>
      </div>

      {/* Vistoria */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-bold text-[#fafafa] mb-4">Vistoria</h2>
        <div className="grid grid-cols-2 gap-2">
          {vistoria.map((item) => (
            <div
              key={item.item}
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                item.ok
                  ? "text-[#10b981] bg-[#10b981]/10"
                  : "text-[#ef4444] bg-[#ef4444]/10"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={item.ok ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
                />
              </svg>
              {item.item}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(isAvailable || isNegotiating) && (
        <div className="sticky bottom-4 flex gap-3">
          <Link
            href="/financiamento"
            className="flex-1 bg-white/[0.04] border border-white/[0.06] text-center py-3 rounded-xl font-medium text-sm text-[#fafafa] hover:bg-white/[0.06] transition-colors"
          >
            Financiar
          </Link>
          <Link
            href="/chat"
            className={`flex-1 text-center py-3 rounded-xl font-bold text-sm transition-colors ${
              isNegotiating
                ? "bg-[#f59e0b] text-[#060608] hover:bg-[#d97706]"
                : "bg-[#10b981] text-[#060608] hover:bg-[#0ea573]"
            }`}
          >
            {isNegotiating ? "Ver Propostas" : "Iniciar Negociacao"}
          </Link>
        </div>
      )}
    </div>
  );
}
