"use client";
import Link from "next/link";
import { useState } from "react";

const stories = [
  { nome: "BMW", cor: "from-blue-600 to-blue-800" },
  { nome: "Porsche", cor: "from-red-600 to-red-800" },
  { nome: "Tesla", cor: "from-gray-700 to-gray-900" },
  { nome: "Mercedes", cor: "from-gray-600 to-gray-800" },
  { nome: "Audi", cor: "from-gray-800 to-black" },
  { nome: "Volvo", cor: "from-blue-800 to-blue-950" },
];

const categorias = [
  { nome: "Estrada", icono: "🚗" },
  { nome: "SUV", icono: "🚙" },
  { nome: "Motos", icono: "🏍️" },
  { nome: "Pesados", icono: "🚛" },
  { nome: "Náutica", icono: "⛵" },
  { nome: "Máquinas", icono: "🏗️" },
];

const viaturas = [
  {
    id: 1,
    marca: "BMW",
    modelo: "Serie 5 530e",
    ano: "2023",
    preco: "42.900",
    km: "15.000",
    combustivel: "Híbrido",
    local: "Lisboa",
    vendedor: "Stand AutoPremium",
    patrocinado: true,
    imagem: "🚗",
  },
  {
    id: 2,
    marca: "Porsche",
    modelo: "Macan S",
    ano: "2022",
    preco: "68.900",
    km: "18.000",
    combustivel: "Gasolina",
    local: "Porto",
    vendedor: "Carlos M.",
    patrocinado: false,
    imagem: "🏎️",
  },
  {
    id: 3,
    marca: "Tesla",
    modelo: "Model 3 LR",
    ano: "2023",
    preco: "44.900",
    km: "12.000",
    combustivel: "Elétrico",
    local: "Braga",
    vendedor: "EcoCars",
    patrocinado: false,
    imagem: "⚡",
  },
  {
    id: 4,
    marca: "Mercedes-Benz",
    modelo: "Classe C 200",
    ano: "2022",
    preco: "38.500",
    km: "22.000",
    combustivel: "Gasolina",
    local: "Lisboa",
    vendedor: "Premium Motors",
    patrocinado: true,
    imagem: "🚗",
  },
  {
    id: 5,
    marca: "Audi",
    modelo: "Q5 40 TDI",
    ano: "2023",
    preco: "49.900",
    km: "10.000",
    combustivel: "Diesel",
    local: "Faro",
    vendedor: "Ana S.",
    patrocinado: false,
    imagem: "🚙",
  },
  {
    id: 6,
    marca: "Volvo",
    modelo: "XC60 B5",
    ano: "2023",
    preco: "52.900",
    km: "8.000",
    combustivel: "Híbrido",
    local: "Coimbra",
    vendedor: "NordAuto",
    patrocinado: false,
    imagem: "🚙",
  },
];

const nearby = [
  { marca: "VW", modelo: "Golf 8 GTI", preco: "33.900", distancia: "2.3 km" },
  {
    marca: "Hyundai",
    modelo: "Tucson N-Line",
    preco: "35.900",
    distancia: "4.1 km",
  },
  {
    marca: "Toyota",
    modelo: "RAV4 Hybrid",
    preco: "36.500",
    distancia: "5.8 km",
  },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍  Pesquisar viaturas, marcas, modelos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none shadow-sm"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {stories.map((s) => (
              <div
                key={s.nome}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${s.cor} flex items-center justify-center border-2 border-accent`}
                >
                  <span className="text-white text-xs font-bold">
                    {s.nome.slice(0, 2)}
                  </span>
                </div>
                <span className="text-[10px] text-muted">{s.nome}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategoria("Todas")}
              className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedCategoria === "Todas"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              Todas
            </button>
            {categorias.map((c) => (
              <button
                key={c.nome}
                onClick={() => setSelectedCategoria(c.nome)}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  selectedCategoria === c.nome
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <span>{c.icono}</span> {c.nome}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">📍 Próximos de Si</h3>
              <Link
                href="/explorar"
                className="text-accent text-xs font-medium"
              >
                Ver todos
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {nearby.map((n) => (
                <div
                  key={`${n.marca}-${n.modelo}`}
                  className="bg-light rounded-lg p-3 min-w-[140px] shrink-0"
                >
                  <p className="text-[10px] text-muted">{n.distancia}</p>
                  <p className="text-xs font-bold">
                    {n.marca} {n.modelo}
                  </p>
                  <p className="text-accent text-sm font-bold mt-1">
                    {n.preco}€
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Feed</h2>
              <span className="text-xs text-muted">
                {viaturas.length} viaturas
              </span>
            </div>
            {viaturas.map((car) => (
              <Link
                key={car.id}
                href={`/viatura/${car.id}`}
                className="block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <span className="text-6xl">{car.imagem}</span>
                  {car.patrocinado && (
                    <span className="absolute top-3 left-3 bg-accent text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                      ⭐ Patrocinado
                    </span>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                    ♡
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-accent text-xs font-semibold">
                        {car.marca}
                      </p>
                      <h3 className="font-bold">{car.modelo}</h3>
                    </div>
                    <p className="text-accent font-bold text-lg">
                      {car.preco}€
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span>{car.ano}</span>
                    <span>•</span>
                    <span>{car.km} km</span>
                    <span>•</span>
                    <span>{car.combustivel}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-accent text-[10px] font-bold">
                        {car.vendedor.slice(0, 1)}
                      </div>
                      <span className="text-xs text-muted">{car.vendedor}</span>
                    </div>
                    <span className="text-xs text-muted">📍 {car.local}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden xl:block w-80 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold">Recomendado para Si</h3>
          <p className="text-xs text-muted">Baseado no teu historial</p>
        </div>
        <div className="p-4 space-y-3">
          {viaturas.slice(0, 3).map((car) => (
            <Link
              key={car.id}
              href={`/viatura/${car.id}`}
              className="flex gap-3 p-2 rounded-lg hover:bg-light transition-colors"
            >
              <div className="w-16 h-16 bg-light rounded-lg flex items-center justify-center text-2xl shrink-0">
                {car.imagem}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-accent font-semibold">{car.marca}</p>
                <p className="text-sm font-bold truncate">{car.modelo}</p>
                <p className="text-accent text-sm font-bold">{car.preco}€</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <h3 className="font-bold mb-3">Top Agentes</h3>
          {[
            { nome: "Ana Rodrigues", vendas: 23, rating: 4.9 },
            { nome: "Carlos Mendes", vendas: 19, rating: 4.8 },
            { nome: "Miguel Costa", vendas: 17, rating: 4.7 },
          ].map((agente) => (
            <Link
              key={agente.nome}
              href={`/agente/${agente.nome}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-light transition-colors"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-accent text-sm font-bold">
                {agente.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{agente.nome}</p>
                <p className="text-xs text-muted">
                  {agente.vendas} vendas · ★ {agente.rating}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
