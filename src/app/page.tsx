"use client";
import Link from "next/link";
import { useState } from "react";
import StatusBadge, { type VehicleStatus } from "@/components/status-badge";

const metricas = [
  {
    titulo: "Total Viaturas",
    valor: "127",
    variacao: "+12%",
    trend: "up",
    cor: "emerald",
    icone:
      "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    titulo: "Em Negociacao",
    valor: "18",
    variacao: "+3 hoje",
    trend: "up",
    cor: "amber",
    icone:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    titulo: "Negocios Fechados",
    valor: "8",
    variacao: "esta semana",
    trend: "neutral",
    cor: "gold",
    icone: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    titulo: "Receita Total",
    valor: "4.2M",
    variacao: "+18%",
    trend: "up",
    cor: "gold",
    icone: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
];

const viaturas: {
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  preco: string;
  specs: string;
  badge: string;
  badgeCor: string;
  status: VehicleStatus;
  tempo: string;
  vistoria: boolean;
}[] = [
  {
    id: 1,
    marca: "BMW",
    modelo: "M3 Competition",
    ano: "2023",
    preco: "18.500.000",
    specs: "Automatico | 3.0L | 510cv",
    badge: "Destaque",
    badgeCor: "emerald",
    status: "disponivel",
    tempo: "2d 14h",
    vistoria: true,
  },
  {
    id: 2,
    marca: "Mercedes-AMG",
    modelo: "GT 63 S",
    ano: "2024",
    preco: "42.000.000",
    specs: "Automatico | 4.0L V8 | 630cv",
    badge: "Leilao",
    badgeCor: "amber",
    status: "em_negociacao",
    tempo: "4h 22m",
    vistoria: true,
  },
  {
    id: 3,
    marca: "Porsche",
    modelo: "911 Turbo S",
    ano: "2024",
    preco: "65.000.000",
    specs: "Automatico | 3.8L Flat-6 | 650cv",
    badge: "Novo",
    badgeCor: "emerald",
    status: "disponivel",
    tempo: "",
    vistoria: false,
  },
  {
    id: 4,
    marca: "Ford",
    modelo: "Mustang GT",
    ano: "2022",
    preco: "12.800.000",
    specs: "Manual | 5.0L V8 | 460cv",
    badge: "Leilao",
    badgeCor: "amber",
    status: "comprado",
    tempo: "",
    vistoria: true,
  },
  {
    id: 5,
    marca: "Audi",
    modelo: "RS6 Avant",
    ano: "2023",
    preco: "28.500.000",
    specs: "Automatico | 4.0L V8 | 600cv",
    badge: "Destaque",
    badgeCor: "emerald",
    status: "em_negociacao",
    tempo: "5d 2h",
    vistoria: true,
  },
  {
    id: 6,
    marca: "Lamborghini",
    modelo: "Huracan EVO",
    ano: "2023",
    preco: "89.000.000",
    specs: "Automatico | 5.2L V10 | 640cv",
    badge: "Premium",
    badgeCor: "gold",
    status: "cancelado",
    tempo: "",
    vistoria: false,
  },
];

const atividades = [
  {
    user: "Joao Silva",
    acao: "fez lance no",
    alvo: "BMW M3",
    valor: "Kz 18.5M",
    tempo: "3min",
    cor: "emerald",
  },
  {
    user: "Maria Santos",
    acao: "anunciou",
    alvo: "Ford Mustang",
    valor: "Novo",
    tempo: "12min",
    cor: "emerald",
  },
  {
    user: "Pedro Costa",
    acao: "fechou negocio",
    alvo: "Audi RS6",
    valor: "Kz 24M",
    tempo: "28min",
    cor: "gold",
  },
  {
    user: "Ana Oliveira",
    acao: "enviou proposta",
    alvo: "Mercedes-AMG",
    valor: "Privada",
    tempo: "45min",
    cor: "gold",
  },
];

const tendencias = [
  { nome: "BMW M Series", variacao: "+24%", pct: 85 },
  { nome: "Mercedes-AMG", variacao: "+18%", pct: 72 },
  { nome: "Porsche 911", variacao: "+12%", pct: 58 },
  { nome: "Ford Mustang", variacao: "+9%", pct: 41 },
];

type FiltroStatus =
  "Todos" | "Disponiveis" | "Em Negociacao" | "Vendidos" | "Cancelados";
const filtros: FiltroStatus[] = [
  "Todos",
  "Disponiveis",
  "Em Negociacao",
  "Vendidos",
  "Cancelados",
];

function matchesFilter(
  car: (typeof viaturas)[number],
  filtro: FiltroStatus,
): boolean {
  if (filtro === "Todos") return true;
  if (filtro === "Disponiveis") return car.status === "disponivel";
  if (filtro === "Em Negociacao") return car.status === "em_negociacao";
  if (filtro === "Vendidos") return car.status === "comprado";
  if (filtro === "Cancelados") return car.status === "cancelado";
  return true;
}

export default function Dashboard() {
  const [filtro, setFiltro] = useState<FiltroStatus>("Todos");
  const viaturasFiltradas = viaturas.filter((car) =>
    matchesFilter(car, filtro),
  );

  return (
    <div className="min-h-screen bg-[#060608]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0c] via-[#0d0d10] to-[#0a0a0c] border border-white/[0.04] p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08)_0%,transparent_50%)]" />
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#fafafa] mb-2">
              Bem-vindo de volta, <span className="text-[#10b981]">Carla</span>
            </h1>
            <p className="text-[#71717a] text-sm lg:text-base mb-6">
              Tens 3 propostas pendentes e 12 viaturas novas desde a tua ultima
              visita.
            </p>

            {/* Metricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {metricas.map((m, i) => (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        m.cor === "emerald"
                          ? "bg-[#10b981]/10"
                          : m.cor === "amber"
                            ? "bg-[#f59e0b]/10"
                            : "bg-[#c9a84c]/10"
                      }`}
                    >
                      <svg
                        className={`w-4.5 h-4.5 ${
                          m.cor === "emerald"
                            ? "text-[#10b981]"
                            : m.cor === "amber"
                              ? "text-[#f59e0b]"
                              : "text-[#c9a84c]"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={m.icone}
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        m.trend === "up" ? "text-[#10b981]" : "text-[#71717a]"
                      }`}
                    >
                      {m.variacao}
                    </span>
                  </div>
                  <p className="text-xl lg:text-2xl font-bold text-[#fafafa]">
                    {m.valor}
                  </p>
                  <p className="text-[12px] text-[#71717a] mt-0.5">
                    {m.titulo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FILTROS + GRID */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#fafafa]">
              Marketplace
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filtros.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all ${
                    filtro === f
                      ? "bg-[#10b981] text-[#060608]"
                      : "bg-white/[0.04] text-[#71717a] hover:bg-white/[0.06] hover:text-[#fafafa]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viaturasFiltradas.map((car) => {
              const isSold = car.status === "comprado";
              const isCancelled = car.status === "cancelado";
              const isDimmed = isSold || isCancelled;

              return (
                <Link
                  key={car.id}
                  href={`/viatura/${car.id}`}
                  className={`glass-card rounded-xl overflow-hidden group relative ${
                    isDimmed ? "opacity-50" : ""
                  }`}
                >
                  {/* Placeholder Image */}
                  <div className="h-44 bg-gradient-to-br from-[#0d0d10] to-[#121215] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-4xl font-bold ${isDimmed ? "text-[#1a1a1f]" : "text-[#27272a]"}`}
                      >
                        {car.marca[0]}
                      </span>
                    </div>

                    {/* Badge (top left) */}
                    <div
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        car.badgeCor === "emerald"
                          ? "bg-[#10b981] text-[#060608]"
                          : car.badgeCor === "amber"
                            ? "bg-[#f59e0b] text-[#060608]"
                            : "bg-[#c9a84c] text-[#060608]"
                      }`}
                    >
                      {car.badge}
                    </div>

                    {/* Status Badge (top right) */}
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={car.status} />
                    </div>

                    {/* Sold Overlay */}
                    {isSold && (
                      <div className="absolute inset-0 bg-[#060608]/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-[#52525b]/80 text-[#fafafa] text-sm font-bold rounded-lg uppercase tracking-wider">
                          Vendido
                        </span>
                      </div>
                    )}

                    {/* Cancelled Overlay */}
                    {isCancelled && (
                      <div className="absolute inset-0 bg-[#060608]/40 flex items-center justify-center">
                        <span className="px-4 py-2 bg-[#ef4444]/20 text-[#ef4444] text-sm font-bold rounded-lg uppercase tracking-wider border border-[#ef4444]/30">
                          Anuncio Cancelado
                        </span>
                      </div>
                    )}

                    {/* Timer for em_negociacao */}
                    {car.status === "em_negociacao" && car.tempo && (
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-[#f59e0b]/90 text-[#060608] text-[10px] font-bold">
                        {car.tempo} restante
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[11px] text-[#71717a] uppercase tracking-wider">
                          {car.marca}
                        </p>
                        <p className="text-[15px] font-semibold text-[#fafafa]">
                          {car.modelo}
                        </p>
                      </div>
                      <span className="text-[11px] text-[#52525b]">
                        {car.ano}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#52525b] mb-3">
                      {car.specs}
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-[15px] font-bold ${isDimmed ? "text-[#52525b]" : "text-[#10b981]"}`}
                      >
                        Kz {car.preco}
                      </p>
                      <div className="flex gap-2">
                        {car.vistoria && (
                          <span
                            className="w-6 h-6 rounded-full bg-[#10b981]/10 flex items-center justify-center"
                            title="Vistoriado"
                          >
                            <svg
                              className="w-3 h-3 text-[#10b981]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {viaturasFiltradas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#52525b] text-sm">
                Nenhuma viatura encontrada para este filtro.
              </p>
            </div>
          )}
        </section>

        {/* ATIVIDADE + TENDENCIAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atividade */}
          <div className="lg:col-span-2 glass-card rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-[#fafafa] mb-4">
              Atividade Recente
            </h3>
            <div className="space-y-3">
              {atividades.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      a.cor === "emerald"
                        ? "bg-[#10b981]/10 text-[#10b981]"
                        : "bg-[#c9a84c]/10 text-[#c9a84c]"
                    }`}
                  >
                    {a.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#fafafa]">
                      <span className="font-medium">{a.user}</span>{" "}
                      <span className="text-[#71717a]">{a.acao}</span>{" "}
                      <span className="font-medium">{a.alvo}</span>
                    </p>
                    <p className="text-[11px] text-[#52525b]">{a.tempo}</p>
                  </div>
                  <span
                    className={`text-[12px] font-semibold ${
                      a.cor === "emerald" ? "text-[#10b981]" : "text-[#c9a84c]"
                    }`}
                  >
                    {a.valor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tendencias */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-[#fafafa] mb-4">
              Tendencias do Mercado
            </h3>
            <div className="space-y-4">
              {tendencias.map((t, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#fafafa]">{t.nome}</span>
                    <span className="text-[12px] font-medium text-[#10b981]">
                      {t.variacao}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#10b981] to-[#10b981]/60 rounded-full"
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
