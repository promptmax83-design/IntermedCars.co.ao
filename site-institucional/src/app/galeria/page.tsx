"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Vehicle = {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  combustivel: string;
  caixa: string;
  cor: string;
  status: string;
};

const filtros = ["Todas", "SUV", "Sedan", "Eletrico", "Hibrido", "Desportivo"];

export default function GaleriaPage() {
  const [veiculos, setVeiculos] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todas");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/vehicles?status=disponivel`);
        if (res.ok) {
          const data = await res.json();
          setVeiculos(data.data || data);
        }
      } catch {
        // API not available
      }
      setLoading(false);
    };

    fetchVehicles();
  }, []);

  const filtrados =
    filtro === "Todas"
      ? veiculos
      : veiculos.filter((v) => {
          const combustivel = v.combustivel?.toLowerCase() || "";
          if (filtro === "Eletrico") return combustivel.includes("eletric");
          if (filtro === "Hibrido") return combustivel.includes("hibrid");
          if (filtro === "SUV") return v.modelo?.toLowerCase().includes("suv") || v.marca?.toLowerCase().includes("tucson") || v.marca?.toLowerCase().includes("q5") || v.marca?.toLowerCase().includes("xc60") || v.marca?.toLowerCase().includes("rav4") || v.marca?.toLowerCase().includes("tiguan");
          if (filtro === "Sedan") return v.modelo?.toLowerCase().includes("serie") || v.modelo?.toLowerCase().includes("classe") || v.modelo?.toLowerCase().includes("model");
          if (filtro === "Desportivo") return v.marca?.toLowerCase().includes("porsche") || v.marca?.toLowerCase().includes("tesla");
          return true;
        });

  return (
    <div className="min-h-screen bg-[#060608]">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#c9a84c] font-semibold tracking-widest uppercase text-sm mb-2">
            As Melhores Viaturas
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#fafafa]">Galeria</h1>
          <p className="text-[#71717a] mt-2">
            {veiculos.length} veiculos disponiveis
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {filtros.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  f === filtro
                    ? "bg-[#10b981] text-[#060608]"
                    : "bg-white/[0.04] text-[#71717a] border border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#71717a]">Nenhum veiculo encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map((v) => (
                <Link
                  key={v.id}
                  href={`/viatura/${v.id}`}
                  className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all group"
                >
                  <div className="h-52 bg-gradient-to-br from-[#0d0d10] to-[#121215] flex items-center justify-center relative">
                    <span className="text-[#1a1a1f] text-4xl font-bold group-hover:scale-110 transition-transform">
                      {v.marca}
                    </span>
                    {v.combustivel && (
                      <div className="absolute top-3 right-3 bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full border border-[#10b981]/20">
                        {v.combustivel}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[#10b981] text-sm font-semibold">{v.marca}</p>
                    <h3 className="text-lg font-bold text-[#fafafa] mt-0.5">{v.modelo}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-[#71717a] mt-3">
                      <span>{v.ano}</span>
                      <span>{v.km?.toLocaleString("pt-AO") || "—"} km</span>
                      <span>{v.caixa || "—"}</span>
                      <span>{v.cor || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/[0.04]">
                      <p className="text-[#10b981] text-xl font-bold">
                        Kz {v.preco?.toLocaleString("pt-AO") || "—"}
                      </p>
                      <span className="text-[#71717a] text-sm group-hover:text-[#10b981] transition-colors">
                        Ver detalhes →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
