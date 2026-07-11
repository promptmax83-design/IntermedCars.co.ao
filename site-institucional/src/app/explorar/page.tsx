"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge, { type VehicleStatus } from "@/components/status-badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const marcas = ["Todas", "BMW", "Mercedes-Benz", "Audi", "Porsche", "Tesla", "Volkswagen", "Volvo", "Toyota", "Hyundai", "Ford", "Renault", "Peugeot", "Opel", "Nissan", "Honda"];
const tiposVeiculo = ["Todos", "Carro", "Carrinha", "Camiao"];

type Vehicle = {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  combustivel: string;
  caixa: string;
  km: number;
  local: string;
  status: VehicleStatus;
  vistoria: boolean;
  primary_image: string | null;
};

type SortOption = "recente" | "preco_menor" | "preco_maior" | "km_menor" | "ano_menor";

function formatKz(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ExplorarPage() {
  const [showFiltros, setShowFiltros] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [marcaFiltro, setMarcaFiltro] = useState("Todas");
  const [pesquisa, setPesquisa] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recente");
  const [resultados, setResultados] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
    setLoading(true);
    const params = new URLSearchParams();
    if (pesquisa) params.set("search", pesquisa);
    params.set("limit", "100");

    fetch(`${API_BASE}/api/vehicles?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setResultados(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setResultados([]);
        setLoading(false);
      });
  }, [pesquisa]);

  const resultadosFiltrados = resultados
    .filter((car) => {
      if (tipoFiltro !== "Todos" && car.tipo.toLowerCase() !== tipoFiltro.toLowerCase()) return false;
      if (marcaFiltro !== "Todas" && car.marca !== marcaFiltro) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "preco_menor": return a.preco - b.preco;
        case "preco_maior": return b.preco - a.preco;
        case "km_menor": return a.km - b.km;
        case "ano_menor": return a.ano - b.ano;
        default: return 0;
      }
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#fafafa]">Explorar</h1>
        <p className="text-sm text-[#71717a]">Encontre a viatura perfeita</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Pesquisar marca, modelo, local..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/30"
        />
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            showFiltros
              ? "bg-[#10b981] text-[#060608] border-[#10b981]"
              : "bg-white/[0.04] border-white/[0.06] text-[#71717a] hover:text-[#fafafa]"
          }`}
        >
          Filtros
        </button>
      </div>

      {/* Filtros */}
      {showFiltros && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
              Tipo de Veiculo
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tiposVeiculo.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoFiltro(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    t === tipoFiltro
                      ? "bg-[#10b981] text-[#060608]"
                      : "bg-white/[0.04] text-[#71717a] hover:bg-white/[0.06]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
              Marca
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {marcas.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarcaFiltro(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    m === marcaFiltro
                      ? "bg-[#10b981] text-[#060608]"
                      : "bg-white/[0.04] text-[#71717a] hover:bg-white/[0.06]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setTipoFiltro("Todos");
                setMarcaFiltro("Todas");
                setPesquisa("");
              }}
              className="px-4 py-2.5 text-[#71717a] text-sm hover:text-[#fafafa] transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#71717a]">
          {resultadosFiltrados.length} viaturas encontradas
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="text-sm border border-white/[0.06] rounded-lg px-3 py-1.5 bg-white/[0.04] text-[#fafafa] outline-none"
        >
          <option value="recente">Mais recentes</option>
          <option value="preco_menor">Preco: menor</option>
          <option value="preco_maior">Preco: maior</option>
          <option value="km_menor">Km: menor</option>
          <option value="ano_menor">Ano: mais novo</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-[#52525b] text-sm">A carregar veiculos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resultadosFiltrados.map((car) => {
            const isDimmed = car.status === "comprado" || car.status === "cancelado";

            return (
              <Link
                key={car.id}
                href={`/viatura/${car.id}`}
                className={`glass-card rounded-xl overflow-hidden group relative ${isDimmed ? "opacity-50" : ""}`}
              >
                <div className="h-40 bg-gradient-to-br from-[#0d0d10] to-[#121215] flex items-center justify-center relative">
                  {car.primary_image ? (
                    <img
                      src={`${API_BASE}/${car.primary_image}`}
                      alt={`${car.marca} ${car.modelo}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`text-5xl font-bold ${isDimmed ? "text-[#1a1a1f]" : "text-[#27272a]"}`}>
                      {car.marca[0]}
                    </span>
                  )}

                  <div className="absolute top-3 right-3">
                    <StatusBadge status={car.status} />
                  </div>

                  {car.status === "comprado" && (
                    <div className="absolute inset-0 bg-[#060608]/60 flex items-center justify-center">
                      <span className="px-4 py-2 bg-[#52525b]/80 text-[#fafafa] text-sm font-bold rounded-lg uppercase tracking-wider">
                        Vendido
                      </span>
                    </div>
                  )}

                  {car.status === "cancelado" && (
                    <div className="absolute inset-0 bg-[#060608]/40 flex items-center justify-center">
                      <span className="px-4 py-2 bg-[#ef4444]/20 text-[#ef4444] text-sm font-bold rounded-lg uppercase tracking-wider border border-[#ef4444]/30">
                        Cancelado
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#10b981] text-xs font-semibold">{car.marca}</p>
                      <p className="font-bold text-[#fafafa]">{car.modelo}</p>
                    </div>
                    <p className={`font-bold ${isDimmed ? "text-[#52525b]" : "text-[#10b981]"}`}>
                      Kz {formatKz(car.preco)}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-[#71717a]">
                    <span>{car.ano}</span>
                    <span>|</span>
                    <span>{car.km.toLocaleString("pt-AO")} km</span>
                    <span>|</span>
                    <span>{car.combustivel}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-[#52525b]">{car.local}</p>
                    {car.vistoria && (
                      <span className="w-5 h-5 rounded-full bg-[#10b981]/10 flex items-center justify-center" title="Vistoriado">
                        <svg className="w-2.5 h-2.5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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

      {!loading && resultadosFiltrados.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#52525b] text-sm">Nenhuma viatura encontrada com estes filtros.</p>
        </div>
      )}
    </div>
  );
}
