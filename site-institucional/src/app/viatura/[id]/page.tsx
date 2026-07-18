"use client";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import StatusBadge, { type VehicleStatus } from "@/components/status-badge";

type ViaturaData = {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  combustivel: string;
  caixa: string;
  cor: string;
  potencia: string;
  tracao: string;
  localizacao: string;
  descricao: string;
  status: VehicleStatus;
  seller?: { id: number; nome: string; verified: boolean; vendas: number };
  images?: string[];
};

export default function ViaturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [viatura, setViatura] = useState<ViaturaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [favoritado, setFavoritado] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/vehicles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Viatura nao encontrada");
        return res.json();
      })
      .then((data) => setViatura(data.data || data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-[600px]">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !viatura) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-6 text-center">
        <p className="text-slate-500">{error || "Viatura nao encontrada"}</p>
        <Link href="/" className="text-[#10b981] text-sm mt-2 inline-block">Voltar ao Feed</Link>
      </div>
    );
  }

  const galeria = viatura.images?.length ? viatura.images : ["/placeholder1.jpg", "/placeholder2.jpg", "/placeholder3.jpg"];
  const isDimmed = viatura.status === "comprado" || viatura.status === "cancelado";
  const isAvailable = viatura.status === "disponivel";
  const isNegotiating = viatura.status === "em_negociacao";
  const vendedor = viatura.seller || { id: 0, nome: "Vendedor", verified: false, vendas: 0 };
  const precoFormatado = viatura.preco.toLocaleString("pt-AO");
  const comissao = "100.000";

  return (
    <div className={`max-w-[1400px] mx-auto px-4 py-6 ${isDimmed ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao Feed
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={viatura.status} size="md" />
          <button
            onClick={() => setFavoritado(!favoritado)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              favoritado
                ? "bg-[#ef4444]/10 text-[#ef4444]"
                : "bg-slate-50 text-slate-500 hover:text-slate-800"
            }`}
          >
            {favoritado ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Sold/Cancelled Overlay */}
      {viatura.status === "comprado" && (
        <div className="mb-6 bg-[#52525b]/10 border border-[#52525b]/20 rounded-xl p-6 text-center">
          <span className="px-6 py-3 bg-[#52525b]/30 text-slate-500 text-lg font-bold rounded-lg uppercase tracking-wider">
            Viatura Vendida
          </span>
          <p className="text-slate-400 text-sm mt-2">Esta viatura ja foi vendida e nao esta disponivel.</p>
        </div>
      )}

      {viatura.status === "cancelado" && (
        <div className="mb-6 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl p-6 text-center">
          <span className="px-6 py-3 bg-[#ef4444]/10 text-[#ef4444] text-lg font-bold rounded-lg uppercase tracking-wider">
            Anuncio Cancelado
          </span>
          <p className="text-slate-400 text-sm mt-2">Este anuncio foi cancelado pelo vendedor.</p>
        </div>
      )}

      {/* === LAYOUT 3 COLUNAS === */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* COLUNA ESQUERDA — Dados Tecnicos */}
        <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
          {/* Identificacao */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Identificacao</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Marca</span>
                <span className="text-[13px] font-semibold text-[#10b981]">{viatura.marca}</span>
              </div>
              <div className="h-px bg-slate-50" />
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Modelo</span>
                <span className="text-[13px] font-semibold text-slate-800">{viatura.modelo}</span>
              </div>
              <div className="h-px bg-slate-50" />
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Ano</span>
                <span className="text-[13px] font-semibold text-slate-800">{viatura.ano}</span>
              </div>
              <div className="h-px bg-slate-50" />
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Cor</span>
                <span className="text-[13px] font-semibold text-slate-800">{viatura.cor}</span>
              </div>
              <div className="h-px bg-slate-50" />
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Localizacao</span>
                <span className="text-[13px] font-semibold text-slate-800">{viatura.localizacao}</span>
              </div>
            </div>
          </div>

          {/* Especificacoes */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Especificacoes</p>
            <div className="space-y-3">
              {[
                { label: "Quilometragem", value: viatura.km.toLocaleString("pt-AO") + " km" },
                { label: "Combustivel", value: viatura.combustivel },
                { label: "Caixa", value: viatura.caixa },
                { label: "Potencia", value: viatura.potencia || "-" },
                { label: "Tracao", value: viatura.tracao || "-" },
                { label: "Lugares", value: "5" },
              ].map((item, i) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-slate-500">{item.label}</span>
                    <span className="text-[13px] font-medium text-slate-800">{item.value}</span>
                  </div>
                  {i < 5 && <div className="h-px bg-slate-50 mt-3" />}
                </div>
              ))}
            </div>
          </div>

          {/* Descricao */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Descricao</p>
            <p className="text-[13px] text-slate-500 leading-relaxed">{viatura.descricao}</p>
          </div>

          {/* Vistoria */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Vistoria</p>
            <div className="grid grid-cols-2 gap-2">
              {["Motor", "Travoes", "Interior", "Pintura", "Pneus", "Suspensao"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[12px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#52525b]" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Disponivel apos negociacao iniciar.</p>
          </div>
        </div>

        {/* COLUNA CENTRAL — Imagem Vertical Estendida */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 bg-gradient-to-br from-slate-100 to-slate-200">
            {/* Imagem principal */}
            <div className="h-[500px] flex items-center justify-center relative">
              <span className="text-[120px] text-[#1a1a1f] font-bold select-none">
                {viatura.marca[0]}
              </span>

              {/* Contador de imagens */}
              <span className="absolute top-4 left-4 bg-[#F8F9FA]/70 backdrop-blur-sm text-slate-800 text-[11px] font-medium px-3 py-1.5 rounded-full border border-slate-200">
                {imagemAtual + 1} / {galeria.length}
              </span>

              {/* Status badge no canto superior direito */}
              <div className="absolute top-4 right-4">
                <StatusBadge status={viatura.status} size="md" />
              </div>

              {/* Overlay glassmorphism na base — nome do modelo */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-6 py-4 border-t border-slate-200">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-[#10b981] font-semibold uppercase tracking-wider">{viatura.marca}</p>
                    <h1 className="text-2xl font-bold text-slate-800 mt-0.5">{viatura.modelo}</h1>
                    <p className="text-[12px] text-slate-500 mt-1">{viatura.localizacao} &middot; {viatura.ano}</p>
                  </div>
                  <p className="text-2xl font-bold text-[#10b981]">
                    Kz {precoFormatado}
                  </p>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 p-3 overflow-x-auto bg-white">
              {galeria.map((_: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImagemAtual(i)}
                  className={`w-[72px] h-[54px] rounded-lg flex items-center justify-center shrink-0 border-2 transition-all duration-200 ${
                    i === imagemAtual
                      ? "border-[#10b981] bg-white/[0.06]"
                      : "border-transparent bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-slate-400 text-[11px] font-medium">{i + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Galeria de imagens abaixo (row horizontal) */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {galeria.map((_: string, i: number) => (
              <button
                key={i}
                onClick={() => setImagemAtual(i)}
                className={`h-20 rounded-xl flex items-center justify-center border-2 transition-all duration-200 ${
                  i === imagemAtual
                    ? "border-[#10b981] bg-white/[0.06]"
                    : "border-transparent bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-slate-400 text-sm">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA — Accoes Financeiras e Vendedor */}
        <div className="lg:col-span-1 space-y-4 order-3">
          {/* Preco Principal */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Preco</p>
            <p className="text-3xl font-bold text-[#10b981]">Kz {precoFormatado}</p>
            <p className="text-[11px] text-slate-400 mt-1">IVA incluido</p>

            <div className="h-px bg-slate-50 my-4" />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Taxa Fixa (Vendedor)</span>
                <span className="text-[13px] font-semibold text-[#c9a84c]">Kz {comissao}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Tu pagas (1%)</span>
                <span className="text-[13px] font-medium text-slate-800">Kz {comissao}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500">Vendedor paga (1%)</span>
                <span className="text-[13px] font-medium text-slate-800">Kz {comissao}</span>
              </div>
            </div>
          </div>

          {/* Vendedor */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Vendedor</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b8933d] flex items-center justify-center text-[#060608] font-bold text-sm shrink-0">
                {vendedor.nome.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{vendedor.nome}</p>
                  {vendedor.verified && (
                    <svg className="w-3.5 h-3.5 text-[#10b981] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{vendedor.vendas} vendas realizadas</p>
              </div>
            </div>
            <Link
              href={`/agente/${vendedor.id}`}
              className="mt-3 block text-center text-[12px] text-[#10b981] hover:text-[#0ea573] transition-colors font-medium"
            >
              Ver perfil completo
            </Link>
          </div>

          {/* Accoes */}
          {(isAvailable || isNegotiating) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Accoes</p>

              <Link
                href="/chat"
                className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isNegotiating
                    ? "bg-[#f59e0b] text-[#060608] hover:bg-[#d97706]"
                    : "bg-[#10b981] text-[#060608] hover:bg-[#0ea573] hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                }`}
              >
                {isNegotiating ? "Ver Propostas" : "Iniciar Negociacao"}
              </Link>

              <Link
                href="/financiamento"
                className="block w-full text-center py-3.5 rounded-xl font-medium text-sm text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Financiar
              </Link>

              <Link
                href="/cofre"
                className="block w-full text-center py-3.5 rounded-xl font-medium text-sm text-[#c9a84c] bg-[#c9a84c]/[0.06] border border-[#c9a84c]/[0.12] hover:bg-[#c9a84c]/[0.1] transition-colors"
              >
                Abrir Cofre
              </Link>
            </div>
          )}

          {/* Seguranca */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Garantia IntermedCars</p>
            <div className="space-y-2.5">
              {[
                "Pagamento seguro no cofre",
                "Vistoria obrigatoria",
                "Taxa fixa 100.000 Kz so apos aprovacao",
                "Suporte 24/7",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-[#10b981] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[12px] text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
