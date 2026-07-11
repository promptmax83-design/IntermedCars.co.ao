"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import StatusBadge, { type VehicleStatus } from "@/components/status-badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Vehicle = {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  specs: string | null;
  combustivel: string;
  caixa: string;
  cor: string;
  potencia: number;
  tracao: string;
  km: number;
  local: string;
  descricao: string | null;
  vendedor_id: number;
  vendedor_nome: string;
  status: VehicleStatus;
  vistoria: boolean;
  primary_image: string | null;
  created_at: string;
};

type Stats = {
  disponivel: number;
  em_negociacao: number;
  comprado: number;
  cancelado: number;
  total: number;
};

type FiltroStatus = "Todos" | "Disponiveis" | "Em Negociacao" | "Vendidos" | "Cancelados";
const filtros: FiltroStatus[] = ["Todos", "Disponiveis", "Em Negociacao", "Vendidos", "Cancelados"];

function statusToFilter(status: VehicleStatus): FiltroStatus {
  switch (status) {
    case "disponivel": return "Disponiveis";
    case "em_negociacao": return "Em Negociacao";
    case "comprado": return "Vendidos";
    case "cancelado": return "Cancelados";
  }
}

function statusToApi(status: FiltroStatus): string | null {
  switch (status) {
    case "Disponiveis": return "disponivel";
    case "Em Negociacao": return "em_negociacao";
    case "Vendidos": return "comprado";
    case "Cancelados": return "cancelado";
    default: return null;
  }
}

function formatKz(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Agora";
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

function getBadge(v: Vehicle): { label: string; color: "emerald" | "amber" | "gold" } {
  if (v.status === "em_negociacao") return { label: "Leilao", color: "amber" };
  if (v.vistoria) return { label: "Destaque", color: "emerald" };
  const created = new Date(v.created_at);
  const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 3) return { label: "Novo", color: "emerald" };
  return { label: "Premium", color: "gold" };
}

export default function Dashboard() {
  const [filtro, setFiltro] = useState<FiltroStatus>("Todos");
  const [viaturas, setViaturas] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<Stats>({ disponivel: 0, em_negociacao: 0, comprado: 0, cancelado: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiStatus = statusToApi(filtro);
    const url = apiStatus
      ? `${API_BASE}/api/vehicles?status=${apiStatus}`
      : `${API_BASE}/api/vehicles`;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setViaturas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setViaturas([]);
        setLoading(false);
      });
  }, [filtro]);

  useEffect(() => {
    fetch(`${API_BASE}/api/vehicles/stats`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#060608]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0c] via-[#0d0d10] to-[#0a0a0c] border border-white/[0.04] p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08)_0%,transparent_50%)]" />
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#fafafa] mb-2">
              IntermedCars <span className="text-[#10b981]">Marketplace</span>
            </h1>
            <p className="text-[#71717a] text-sm lg:text-base mb-6">
              Compre e venda veiculos de forma segura e transparente em Angola.
            </p>

            {/* Metricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#10b981]/10">
                    <svg className="w-4.5 h-4.5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-[#fafafa]">{stats.total}</p>
                <p className="text-[12px] text-[#71717a] mt-0.5">Total Viaturas</p>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#10b981]/10">
                    <svg className="w-4.5 h-4.5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-[#fafafa]">{stats.disponivel}</p>
                <p className="text-[12px] text-[#71717a] mt-0.5">Disponiveis</p>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f59e0b]/10">
                    <svg className="w-4.5 h-4.5 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-[#fafafa]">{stats.em_negociacao}</p>
                <p className="text-[12px] text-[#71717a] mt-0.5">Em Negociacao</p>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#c9a84c]/10">
                    <svg className="w-4.5 h-4.5 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-[#fafafa]">{stats.comprado}</p>
                <p className="text-[12px] text-[#71717a] mt-0.5">Negocios Fechados</p>
              </div>
            </div>
          </div>
        </section>

        {/* FILTROS + GRID */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#fafafa]">Marketplace</h2>
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

          {loading ? (
            <div className="text-center py-16">
              <p className="text-[#52525b] text-sm">A carregar veiculos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {viaturas.map((car) => {
                const isSold = car.status === "comprado";
                const isCancelled = car.status === "cancelado";
                const isDimmed = isSold || isCancelled;
                const badge = getBadge(car);

                return (
                  <Link
                    key={car.id}
                    href={`/viatura/${car.id}`}
                    className={`glass-card rounded-xl overflow-hidden group relative ${isDimmed ? "opacity-50" : ""}`}
                  >
                    {/* Image */}
                    <div className="h-44 bg-gradient-to-br from-[#0d0d10] to-[#121215] relative">
                      {car.primary_image ? (
                        <img
                          src={`${API_BASE}/${car.primary_image}`}
                          alt={`${car.marca} ${car.modelo}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-4xl font-bold ${isDimmed ? "text-[#1a1a1f]" : "text-[#27272a]"}`}>
                            {car.marca[0]}
                          </span>
                        </div>
                      )}

                      {/* Badge (top left) */}
                      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        badge.color === "emerald"
                          ? "bg-[#10b981] text-[#060608]"
                          : badge.color === "amber"
                            ? "bg-[#f59e0b] text-[#060608]"
                            : "bg-[#c9a84c] text-[#060608]"
                      }`}>
                        {badge.label}
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

                      {isCancelled && (
                        <div className="absolute inset-0 bg-[#060608]/40 flex items-center justify-center">
                          <span className="px-4 py-2 bg-[#ef4444]/20 text-[#ef4444] text-sm font-bold rounded-lg uppercase tracking-wider border border-[#ef4444]/30">
                            Cancelado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[11px] text-[#71717a] uppercase tracking-wider">{car.marca}</p>
                          <p className="text-[15px] font-semibold text-[#fafafa]">{car.modelo}</p>
                        </div>
                        <span className="text-[11px] text-[#52525b]">{car.ano}</span>
                      </div>
                      <p className="text-[12px] text-[#52525b] mb-3">
                        {car.caixa === "automatica" ? "Automatico" : "Manual"} | {car.combustivel} | {car.km.toLocaleString("pt-AO")} km
                      </p>
                      <div className="flex items-center justify-between">
                        <p className={`text-[15px] font-bold ${isDimmed ? "text-[#52525b]" : "text-[#10b981]"}`}>
                          Kz {formatKz(car.preco)}
                        </p>
                        {car.vistoria && (
                          <span className="w-6 h-6 rounded-full bg-[#10b981]/10 flex items-center justify-center" title="Vistoriado">
                            <svg className="w-3 h-3 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && viaturas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#52525b] text-sm">Nenhuma viatura encontrada para este filtro.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
