"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";

type AgenteData = {
  id: number;
  nome: string;
  verified: boolean;
  vendas: number;
  rating?: number;
  avaliacoes?: number;
  nivel?: string;
  ranking?: number;
  medalhas?: string[];
};

export default function AgentePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [agente, setAgente] = useState<AgenteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Agente nao encontrado");
        return res.json();
      })
      .then((data) => setAgente(data.data || data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !agente) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-[#71717a]">{error || "Agente nao encontrado"}</p>
        <Link href="/" className="text-[#10b981] text-sm mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const initials = agente.nome.split(" ").map((n: string) => n[0]).join("");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-[#c9a84c] to-[#0d0d10] relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-full bg-[#0d0d10] border-4 border-[#060608] flex items-center justify-center text-[#c9a84c] font-bold text-2xl">
              {initials}
            </div>
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#fafafa]">{agente.nome}</h1>
            {agente.verified && <span className="text-[#10b981] text-sm">Verificado</span>}
          </div>
          <p className="text-sm text-[#71717a]">Membro IntermedCars</p>
          {agente.rating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[#c9a84c]">{"★".repeat(Math.round(agente.rating))}</span>
              <span className="text-sm text-[#71717a]">{agente.rating} ({agente.avaliacoes || 0} avaliacoes)</span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {agente.nivel && (
              <span className="bg-[#c9a84c]/10 text-[#c9a84c] text-xs font-bold px-3 py-1 rounded-full">
                Nivel {agente.nivel}
              </span>
            )}
            {agente.ranking && (
              <span className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full">
                Ranking #{agente.ranking}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { valor: String(agente.vendas || 0), label: "Vendas" },
          { valor: agente.rating ? `${agente.rating}%` : "-", label: "Sucesso" },
          { valor: agente.ranking ? `#${agente.ranking}` : "-", label: "Ranking" },
          { valor: agente.medalhas?.length ? String(agente.medalhas.length) : "0", label: "Medalhas" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-[#10b981]">{s.valor}</p>
            <p className="text-[10px] text-[#71717a] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Medalhas */}
      {agente.medalhas && agente.medalhas.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h2 className="font-bold text-[#fafafa] mb-3">Medalhas</h2>
          <div className="flex gap-3 flex-wrap">
            {agente.medalhas.map((m: string) => (
              <div key={m} className="bg-white/[0.04] rounded-lg px-3 py-2 text-xs font-medium text-[#fafafa]">
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
