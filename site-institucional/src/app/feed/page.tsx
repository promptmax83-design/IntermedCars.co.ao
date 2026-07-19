"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Vehicle = {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  zona: string;
  status: string;
  images: string[];
};

function formatKz(v: number) {
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function FeedPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/vehicles?status=disponivel`)
      .then((r) => r.json())
      .then((d) => setVehicles(d.data || d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">A carregar feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Bem-vindo{user?.nome ? `, ${user.nome.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-slate-500">Descubra os melhores negocios em Angola.</p>
          </div>
          <Link
            href="/anunciar"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
          >
            + Anunciar Veiculo
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Grid */}
          <div className="lg:col-span-2">
            {vehicles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-800">Nenhum veiculo disponivel</p>
                <p className="text-xs text-slate-500 mt-1">Volte mais tarde ou anuncie o seu proprio veiculo.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <Link
                    key={v.id}
                    href={`/viatura/${v.id}`}
                    className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                      <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-sm">
                        {v.ano}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {v.marca} {v.modelo}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-emerald-600 font-bold text-sm">
                          Kz {formatKz(v.preco)}
                        </p>
                        {v.zona && (
                          <p className="text-xs text-slate-400">{v.zona}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Plataforma</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Veiculos disponiveis</span>
                  <span className="text-xs font-bold text-slate-800">{vehicles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Cobertura</span>
                  <span className="text-xs font-bold text-emerald-600">Angola</span>
                </div>
              </div>
            </div>

            <Link
              href="/encontrar-consultor"
              className="block bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Encontrar Consultor</p>
                  <p className="text-xs text-slate-500">Pesquise por codigo ou zona</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
