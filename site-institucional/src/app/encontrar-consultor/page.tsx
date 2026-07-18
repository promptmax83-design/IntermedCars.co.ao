"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Consultant {
  id: number;
  fullname: string;
  phone: string;
  codigo_referencia: string;
  rank: string;
  rating: number;
  total_deals: number;
  zone: string;
}

const rankColors: Record<string, string> = {
  Bronze: "text-[#cd7f32]",
  Prata: "text-[#c0c0c0]",
  Ouro: "text-[#ffd700]",
  Embaixador: "text-emerald-600",
};

const rankStars: Record<string, number> = {
  Bronze: 1,
  Prata: 2,
  Ouro: 3,
  Embaixador: 4,
};

export default function EncontrarConsultorPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [searchZone, setSearchZone] = useState("");
  const [selected, setSelected] = useState<Consultant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const url = searchZone
        ? `${API_BASE}/api/consultants?zone=${encodeURIComponent(searchZone)}`
        : `${API_BASE}/api/consultants`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success !== false) {
        setConsultants(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      setError("Erro ao carregar consultores");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCode = async () => {
    if (!searchCode.trim()) return;
    setError(null);
    setSelected(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/consultants?search=${encodeURIComponent(searchCode)}`
      );
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      const found = list.find(
        (c: Consultant) =>
          c.codigo_referencia?.toUpperCase() === searchCode.toUpperCase()
      );
      if (found) {
        setSelected(found);
      } else {
        setError("Consultor nao encontrado com esse codigo");
      }
    } catch {
      setError("Erro ao pesquisar consultor");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-slate-800">
            Encontrar Consultor
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Como o Yango — encontra o consultor certo para o teu negocio
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Search by Code */}
        <div className="space-y-3">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Digite o codigo do consultor
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="IMC-0001"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 font-mono tracking-wider outline-none shadow-sm focus:border-emerald-500/40 transition-colors"
            />
            <button
              onClick={handleSearchCode}
              disabled={!searchCode.trim()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Buscar
            </button>
          </div>
          {error && (
            <p className="text-[13px] text-red-500">{error}</p>
          )}
        </div>

        {/* Search by Zone */}
        <div className="space-y-3">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Ou pesquisar por zona
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchZone}
              onChange={(e) => setSearchZone(e.target.value)}
              placeholder="Ex: Luanda, Huambo, Benguela..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none shadow-sm focus:border-emerald-500/40 transition-colors"
            />
            <button
              onClick={fetchConsultants}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Selected Consultant */}
        {selected && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-lg font-bold text-white">
                {selected.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-slate-800">
                  {selected.fullname}
                </h3>
                <p className="text-[12px] text-emerald-600 font-mono">
                  {selected.codigo_referencia}
                </p>
                <p className="text-[12px] text-slate-500">
                  Zona: {selected.zone}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-[13px] font-bold ${
                    rankColors[selected.rank] || "text-slate-800"
                  }`}
                >
                  {selected.rank}
                </span>
                <div className="flex gap-0.5 justify-end mt-1">
                  {Array.from({ length: rankStars[selected.rank] || 1 }).map(
                    (_, i) => (
                      <svg
                        key={i}
                        className="w-3 h-3 text-amber-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-[18px] font-bold text-slate-800">
                  {selected.total_deals}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">Deals</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-[18px] font-bold text-amber-500">
                  {Number(selected.rating).toFixed(1)}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">Rating</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-[18px] font-bold text-emerald-600">
                  {selected.rank}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">Rank</p>
              </div>
            </div>

            <Link
              href={`/chat?consultant=${selected.id}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Falar com Consultor
            </Link>
          </div>
        )}

        {/* Consultants List */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Consultores Disponiveis
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-400">
              A carregar consultores...
            </div>
          ) : consultants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">
                Nenhum consultor encontrado
              </p>
              <p className="text-slate-400 text-[12px] mt-1">
                Tenta pesquisar por outra zona
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {consultants.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                    selected?.id === c.id
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-slate-200/60 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-[13px] font-bold text-white">
                    {c.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-800 truncate">
                      {c.fullname}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-mono">
                      {c.codigo_referencia}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-[12px] font-bold ${
                        rankColors[c.rank] || "text-slate-800"
                      }`}
                    >
                      {c.rank}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {Number(c.rating).toFixed(1)}★
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
