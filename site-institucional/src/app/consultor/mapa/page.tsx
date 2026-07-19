"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsultorMapaPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mapa</h1>
        <p className="text-sm text-slate-500">
          Veiculos e consultores na sua zona
        </p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden">
        <div className="min-h-[400px] bg-slate-100 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto">
              <svg
                className="w-7 h-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503.249l1.624 1.624c.683.683 1.808.21 1.808-.778V6.356c0-.99-1.118-1.618-1.808-.89L9.503 7.873M12 2.25l7.624 7.624c.683.683.21 1.808-.778 1.808H12m0 0V4.5m0 0L4.376 12.124c-.683.683-.21 1.808.778 1.808H12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Mapa - Integracao Leaflet em breve
            </p>
            <p className="text-xs text-slate-500">
              Localizacao, marcadores e raio de cobertura aparecerao aqui.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-800">Atualizar Localizacao</h2>
        <p className="text-sm text-slate-500">
          Atualize a sua posicao para ser visivel para veiculos proximos.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#b8983f] text-[#060608] text-sm font-semibold rounded-lg transition-colors">
            Usar Minha Localizacao Atual
          </button>
          <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors">
            Definir Manualmente
          </button>
        </div>
      </div>
    </div>
  );
}
