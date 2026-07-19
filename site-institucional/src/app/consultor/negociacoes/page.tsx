"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Negotiation = {
  id: number;
  veiculo_marca: string;
  veiculo_modelo: string;
  veiculo_ano: number;
  preco: number;
  status: string;
  comprador_nome: string;
  vendedor_nome: string;
  created_at: string;
};

type Filter = "todas" | "ativas" | "concluidas" | "canceladas";

const statusColors: Record<string, string> = {
  pendente: "bg-amber-50 text-amber-700",
  aceite: "bg-emerald-50 text-emerald-700",
  em_negociacao: "bg-blue-50 text-blue-700",
  vistoria: "bg-purple-50 text-purple-700",
  concluida: "bg-emerald-50 text-emerald-700",
  cancelada: "bg-red-50 text-red-700",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  aceite: "Aceite",
  em_negociacao: "Em Negociacao",
  vistoria: "Em Vistoria",
  concluida: "Concluida",
  cancelada: "Cancelada",
};

const filterTabs: { key: Filter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "ativas", label: "Ativas" },
  { key: "concluidas", label: "Concluidas" },
  { key: "canceladas", label: "Canceladas" },
];

const activeFilters: string[] = ["pendente", "aceite", "em_negociacao", "vistoria"];

export default function ConsultorNegociacoesPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Filter>("todas");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, authLoading, router]);

  const fetchNegotiations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/negotiations/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNegotiations(Array.isArray(data.data || data) ? data.data || data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNegotiations();
    }
  }, [isLoggedIn, fetchNegotiations]);

  const filteredNegotiations = negotiations.filter((neg) => {
    if (activeFilter === "todas") return true;
    if (activeFilter === "ativas") return activeFilters.includes(neg.status);
    if (activeFilter === "concluidas") return neg.status === "concluida";
    if (activeFilter === "canceladas") return neg.status === "cancelada";
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">A carregar negociacoes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Negociacoes</h1>
        <p className="text-sm text-slate-500">
          Todas as suas negociacoes como intermediario
        </p>
      </div>

      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredNegotiations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-800">
            Nenhuma negociacao encontrada
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {activeFilter === "todas"
              ? "Ainda nao tem negociacoes registadas."
              : `Nenhuma negociacao com estado "${filterTabs.find((t) => t.key === activeFilter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredNegotiations.map((neg) => (
              <Link
                key={neg.id}
                href={`/negociacao/${neg.id}`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 truncate">
                        {neg.veiculo_marca} {neg.veiculo_modelo}
                      </span>
                      <span className="text-xs text-slate-500">
                        {neg.veiculo_ano}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Vendedor: {neg.vendedor_nome || "N/D"}</span>
                      <span>Comprador: {neg.comprador_nome || "N/D"}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(neg.created_at).toLocaleDateString("pt-AO")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-slate-800">
                      Kz {neg.preco.toLocaleString("pt-AO")}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                        statusColors[neg.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabels[neg.status] || neg.status}
                    </span>
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
