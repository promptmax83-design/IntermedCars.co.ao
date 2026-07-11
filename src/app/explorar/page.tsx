"use client";
import { useState } from "react";
import Link from "next/link";
import StatusBadge, { type VehicleStatus } from "@/components/status-badge";

const marcas = [
  "Todas",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Porsche",
  "Tesla",
  "Volkswagen",
  "Volvo",
  "Toyota",
  "Hyundai",
];

const tiposVeiculo = ["Todos", "Carro", "Carrinha", "Camiao"];

type Resultado = {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  preco: string;
  km: string;
  ano: string;
  combustivel: string;
  local: string;
  status: VehicleStatus;
};

const resultados: Resultado[] = [
  {
    id: 1,
    tipo: "Carro",
    marca: "BMW",
    modelo: "Serie 5 530e",
    preco: "42.900.000",
    km: "15.000",
    ano: "2023",
    combustivel: "Hibrido",
    local: "Luanda",
    status: "disponivel",
  },
  {
    id: 2,
    tipo: "Carro",
    marca: "Mercedes",
    modelo: "Classe C 200",
    preco: "38.500.000",
    km: "22.000",
    ano: "2022",
    combustivel: "Gasolina",
    local: "Luanda",
    status: "em_negociacao",
  },
  {
    id: 3,
    tipo: "Carro",
    marca: "Tesla",
    modelo: "Model 3 LR",
    preco: "44.900.000",
    km: "12.000",
    ano: "2023",
    combustivel: "Eletrico",
    local: "Benguela",
    status: "disponivel",
  },
  {
    id: 4,
    tipo: "Carro",
    marca: "Audi",
    modelo: "Q5 40 TDI",
    preco: "49.900.000",
    km: "10.000",
    ano: "2023",
    combustivel: "Diesel",
    local: "Lubango",
    status: "disponivel",
  },
  {
    id: 5,
    tipo: "Carro",
    marca: "Porsche",
    modelo: "Macan S",
    preco: "68.900.000",
    km: "18.000",
    ano: "2022",
    combustivel: "Gasolina",
    local: "Luanda",
    status: "comprado",
  },
  {
    id: 6,
    tipo: "Carrinha",
    marca: "Volvo",
    modelo: "XC60 B5",
    preco: "52.900.000",
    km: "8.000",
    ano: "2023",
    combustivel: "Hibrido",
    local: "Cabinda",
    status: "disponivel",
  },
];

export default function ExplorarPage() {
  const [showFiltros, setShowFiltros] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [marcaFiltro, setMarcaFiltro] = useState("Todas");
  const [pesquisa, setPesquisa] = useState("");

  const resultadosFiltrados = resultados.filter((car) => {
    if (tipoFiltro !== "Todos" && car.tipo !== tipoFiltro) return false;
    if (marcaFiltro !== "Todas" && car.marca !== marcaFiltro) return false;
    if (pesquisa) {
      const p = pesquisa.toLowerCase();
      if (
        !car.marca.toLowerCase().includes(p) &&
        !car.modelo.toLowerCase().includes(p)
      )
        return false;
    }
    return true;
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
          placeholder="Pesquisar marca, modelo, ano..."
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Preco Min
              </label>
              <input
                type="number"
                placeholder="Kz"
                className="w-full mt-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Preco Max
              </label>
              <input
                type="number"
                placeholder="Kz"
                className="w-full mt-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Ano Min
              </label>
              <input
                type="number"
                placeholder="2020"
                className="w-full mt-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">
                Km Max
              </label>
              <input
                type="number"
                placeholder="50000"
                className="w-full mt-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-[#fafafa] placeholder-[#52525b] outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="flex-1 bg-[#10b981] text-[#060608] py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0ea573] transition-colors">
              Aplicar Filtros
            </button>
            <button className="px-4 py-2.5 text-[#71717a] text-sm hover:text-[#fafafa] transition-colors">
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
        <select className="text-sm border border-white/[0.06] rounded-lg px-3 py-1.5 bg-white/[0.04] text-[#fafafa] outline-none">
          <option>Mais relevantes</option>
          <option>Preco: menor</option>
          <option>Preco: maior</option>
          <option>Mais recentes</option>
          <option>Km: menor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resultadosFiltrados.map((car) => {
          const isDimmed =
            car.status === "comprado" || car.status === "cancelado";

          return (
            <Link
              key={car.id}
              href={`/viatura/${car.id}`}
              className={`glass-card rounded-xl overflow-hidden group relative ${isDimmed ? "opacity-50" : ""}`}
            >
              <div className="h-40 bg-gradient-to-br from-[#0d0d10] to-[#121215] flex items-center justify-center relative">
                <span
                  className={`text-5xl font-bold ${isDimmed ? "text-[#1a1a1f]" : "text-[#27272a]"}`}
                >
                  {car.marca[0]}
                </span>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={car.status} />
                </div>

                {/* Sold Overlay */}
                {car.status === "comprado" && (
                  <div className="absolute inset-0 bg-[#060608]/60 flex items-center justify-center">
                    <span className="px-4 py-2 bg-[#52525b]/80 text-[#fafafa] text-sm font-bold rounded-lg uppercase tracking-wider">
                      Vendido
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#10b981] text-xs font-semibold">
                      {car.marca}
                    </p>
                    <p className="font-bold text-[#fafafa]">{car.modelo}</p>
                  </div>
                  <p
                    className={`font-bold ${isDimmed ? "text-[#52525b]" : "text-[#10b981]"}`}
                  >
                    Kz {car.preco}
                  </p>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-[#71717a]">
                  <span>{car.ano}</span>
                  <span>|</span>
                  <span>{car.km} km</span>
                  <span>|</span>
                  <span>{car.combustivel}</span>
                </div>
                <p className="text-xs text-[#52525b] mt-2">{car.local}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
