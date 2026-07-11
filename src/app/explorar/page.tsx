"use client";
import { useState } from "react";
import Link from "next/link";

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
const combustiveis = [
  "Todos",
  "Gasolina",
  "Diesel",
  "Elétrico",
  "Híbrido",
  "Híbrido Plug-in",
];
const caixas = ["Todas", "Manual", "Automática"];
const provincias = [
  "Todas",
  "Lisboa",
  "Porto",
  "Braga",
  "Faro",
  "Coimbra",
  "Setúbal",
  "Aveiro",
];

const resultados = [
  {
    id: 1,
    marca: "BMW",
    modelo: "Serie 5 530e",
    preco: "42.900",
    km: "15.000",
    ano: "2023",
    combustivel: "Híbrido",
    local: "Lisboa",
  },
  {
    id: 2,
    marca: "Mercedes",
    modelo: "Classe C 200",
    preco: "38.500",
    km: "22.000",
    ano: "2022",
    combustivel: "Gasolina",
    local: "Lisboa",
  },
  {
    id: 3,
    marca: "Tesla",
    modelo: "Model 3 LR",
    preco: "44.900",
    km: "12.000",
    ano: "2023",
    combustivel: "Elétrico",
    local: "Braga",
  },
  {
    id: 4,
    marca: "Audi",
    modelo: "Q5 40 TDI",
    preco: "49.900",
    km: "10.000",
    ano: "2023",
    combustivel: "Diesel",
    local: "Faro",
  },
  {
    id: 5,
    marca: "Porsche",
    modelo: "Macan S",
    preco: "68.900",
    km: "18.000",
    ano: "2022",
    combustivel: "Gasolina",
    local: "Porto",
  },
  {
    id: 6,
    marca: "Volvo",
    modelo: "XC60 B5",
    preco: "52.900",
    km: "8.000",
    ano: "2023",
    combustivel: "Híbrido",
    local: "Coimbra",
  },
];

export default function ExplorarPage() {
  const [showFiltros, setShowFiltros] = useState(false);
  const [marcaFiltro, setMarcaFiltro] = useState("Todas");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explorar</h1>
        <p className="text-sm text-muted">Encontre a viatura perfeita</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔍 Pesquisar marca, modelo, ano..."
          className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showFiltros ? "bg-primary text-white border-primary" : "bg-white border-gray-200"}`}
        >
          ⚙ Filtros
        </button>
      </div>

      {showFiltros && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Marca
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {marcas.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarcaFiltro(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${m === marcaFiltro ? "bg-primary text-white" : "bg-light text-gray-600"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Preço Mín
              </label>
              <input
                type="number"
                placeholder="€"
                className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Preço Máx
              </label>
              <input
                type="number"
                placeholder="€"
                className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Ano Mín
              </label>
              <input
                type="number"
                placeholder="2020"
                className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Km Máx
              </label>
              <input
                type="number"
                placeholder="50000"
                className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Combustível
              </label>
              <select className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none">
                {combustiveis.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Caixa
              </label>
              <select className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none">
                {caixas.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Província
              </label>
              <select className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none">
                {provincias.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Cor
              </label>
              <input
                type="text"
                placeholder="Ex: Preto"
                className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Tração
              </label>
              <select className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none">
                <option>Todas</option>
                <option>Dianteira</option>
                <option>Traseira</option>
                <option>4x4</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Potência Mín
              </label>
              <input
                type="number"
                placeholder="cv"
                className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase">
                Município
              </label>
              <input
                type="text"
                placeholder="Ex: Sintra"
                className="w-full mt-1 px-3 py-2 bg-light rounded-lg text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="flex-1 bg-accent text-primary py-2.5 rounded-lg font-semibold text-sm">
              Aplicar Filtros
            </button>
            <button className="px-4 py-2.5 text-muted text-sm">Limpar</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {resultados.length} viaturas encontradas
        </p>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
          <option>Mais relevantes</option>
          <option>Preço: menor</option>
          <option>Preço: maior</option>
          <option>Mais recentes</option>
          <option>Km: menor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resultados.map((car) => (
          <Link
            key={car.id}
            href={`/viatura/${car.id}`}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-5xl">🚗</span>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-accent text-xs font-semibold">
                    {car.marca}
                  </p>
                  <p className="font-bold">{car.modelo}</p>
                </div>
                <p className="text-accent font-bold">{car.preco}€</p>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted">
                <span>{car.ano}</span>
                <span>•</span>
                <span>{car.km} km</span>
                <span>•</span>
                <span>{car.combustivel}</span>
              </div>
              <p className="text-xs text-muted mt-2">📍 {car.local}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
