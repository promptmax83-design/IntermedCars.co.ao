"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Banido {
  id: number;
  status: string;
  consultor_nome: string;
  motivo_decisao_admin: string;
  exposto_em: string;
  marca: string;
  modelo: string;
  badge_cor: "amber" | "red";
  badge_label: string;
}

export default function ConsultoresBanidosPage() {
  const [banidos, setBanidos] = useState<Banido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/consultores-banidos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBanidos(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Consultores Banidos</h1>
              <p className="text-[13px] text-slate-500">Utilizadores suspensos por incumprimento das regras da plataforma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : banidos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Nenhum consultor banido</h2>
            <p className="text-[13px] text-slate-500">
              Todos os consultores estão em conformidade com as regras da plataforma.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[12px] text-slate-400 mb-4">
              {banidos.length} caso(s) registado(s)
            </p>

            {banidos.map((banido) => (
              <div
                key={banido.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{banido.consultor_nome}</p>
                      <p className="text-[11px] text-slate-400">
                        {banido.marca} {banido.modelo}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      banido.badge_cor === "amber"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {banido.badge_label}
                  </span>
                </div>

                <p className="text-[13px] text-slate-600 mb-3">
                  {banido.motivo_decisao_admin}
                </p>

                <p className="text-[11px] text-slate-400">
                  Exposto em{" "}
                  {new Date(banido.exposto_em).toLocaleDateString("pt-AO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[12px] text-amber-800">
                <strong>Nota:</strong> A exposição pública segue a política de segurança do IntermedCars.
                Consultores que submetam relato dentro do prazo e sejam aprovados têm a sua conta reativada.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
