"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Negotiation {
  id: number;
  status: string;
  vehicle_id: number;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    mileage: number;
  };
  created_at: string;
}

interface InspectionItem {
  category: string;
  rating: number;
  notes: string;
}

const CHECKLIST_CATEGORIES = [
  "Motor",
  "Travoes",
  "Suspensao",
  "Carrocaria",
  "Interior",
  "Tenis",
  "Eletrica",
  "Documentacao",
];

export default function VistoriaPage() {
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get("negotiation");

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [vehicle, setVehicle] = useState<Negotiation["vehicle"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [inspections, setInspections] = useState<InspectionItem[]>(
    CHECKLIST_CATEGORIES.map((cat) => ({ category: cat, rating: 3, notes: "" }))
  );
  const [proposedPrice, setProposedPrice] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (negotiationId) {
          const res = await fetch(
            `${API_BASE}/api/negotiations/${negotiationId}`
          );
          if (!res.ok) throw new Error("Erro ao carregar negociacao");
          const data = await res.json();
          if (cancelled) return;
          setNegotiation(data);

          if (data.vehicle_id) {
            const vRes = await fetch(
              `${API_BASE}/api/vehicles/${data.vehicle_id}`
            );
            if (vRes.ok) {
              const vData = await vRes.json();
              if (!cancelled) setVehicle(vData);
            }
          }
        } else {
          const res = await fetch(`${API_BASE}/api/negotiations/user`);
          if (!res.ok) throw new Error("Erro ao carregar negociacoes");
          const data = await res.json();
          if (!cancelled) setNegotiations(data);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [negotiationId]);

  const handleInspectionChange = (
    index: number,
    field: "rating" | "notes",
    value: number | string
  ) => {
    setInspections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
      setError("Insira um preco proposto valido");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        inspections,
        proposed_price: parseFloat(proposedPrice),
      };

      const res = await fetch(
        `${API_BASE}/api/negotiations/${negotiationId}/inspection`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Erro ao submeter vistoria");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">A carregar...</p>
        </div>
      </div>
    );
  }

  if (error && !negotiation && !negotiations.length) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              if (negotiationId) {
                fetch(`${API_BASE}/api/negotiations/${negotiationId}`)
                  .then((r) => r.json())
                  .then((d) => {
                    setNegotiation(d);
                    if (d.vehicle_id) {
                      fetch(`${API_BASE}/api/vehicles/${d.vehicle_id}`)
                        .then((r) => r.json())
                        .then(setVehicle);
                    }
                  })
                  .catch(() => setError("Erro ao recarregar"))
                  .finally(() => setLoading(false));
              } else {
                fetch(`${API_BASE}/api/negotiations/user`)
                  .then((r) => r.json())
                  .then(setNegotiations)
                  .catch(() => setError("Erro ao recarregar"))
                  .finally(() => setLoading(false));
              }
            }}
            className="text-sm text-[#10b981] hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!negotiationId) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Vistoria</h1>
            <p className="text-sm text-slate-500">
              Selecione uma negociacao para iniciar a vistoria
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {negotiations.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-800">Nenhuma negociacao encontrada</p>
              <p className="text-xs text-slate-500 mt-1">Negociacoes para vistoria aparecerao aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {negotiations.map((n) => (
                <Link
                  key={n.id}
                  href={`/vistoria?negotiation=${n.id}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {n.vehicle
                          ? `${n.vehicle.brand} ${n.vehicle.model}`
                          : `Negociacao #${n.id}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {n.vehicle
                          ? `${n.vehicle.year} · ${n.vehicle.color}`
                          : `ID: ${n.vehicle_id}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded-full">
                        {n.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-[#10b981] text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Vistoria Submetida
          </h2>
          <p className="text-sm text-slate-500">
            A vistoria foi registada com sucesso. O consultor ira analisar os
            resultados.
          </p>
          <Link
            href="/vistoria"
            className="inline-block text-sm text-[#10b981] hover:underline"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const totalRated = inspections.filter((i) => i.rating > 0).length;
  const avgRating =
    inspections.reduce((acc, i) => acc + i.rating, 0) / inspections.length;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/vistoria"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Voltar
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vistoria</h1>
          <p className="text-sm text-slate-500">
            {vehicle
              ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}`
              : `Negociacao #${negotiationId}`}
          </p>
        </div>

        {vehicle && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Viatura
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Ano
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {vehicle.year}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Cor
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {vehicle.color}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Matricula
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {vehicle.plate}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Quilometragem
                </p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {vehicle.mileage.toLocaleString("pt-PT")} km
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Progresso da Vistoria
              </p>
              <p className="text-xs text-slate-500">
                {totalRated}/{CHECKLIST_CATEGORIES.length} categorias · Media:{" "}
                {avgRating.toFixed(1)}/5
              </p>
            </div>
            <p className="text-[#10b981] font-bold text-lg">
              {totalRated}/{CHECKLIST_CATEGORIES.length}
            </p>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-2">
            <div
              className="bg-[#10b981] h-2 rounded-full transition-all"
              style={{
                width: `${(totalRated / CHECKLIST_CATEGORIES.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {inspections.map((inspection, index) => (
            <div
              key={inspection.category}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#10b981]/10 text-[#10b981] rounded-full flex items-center justify-center text-sm font-bold">
                      {inspection.rating}
                    </span>
                    <span className="font-medium text-sm text-slate-800">
                      {inspection.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          handleInspectionChange(index, "rating", star)
                        }
                        className={`w-6 h-6 rounded text-xs transition-colors ${
                          star <= inspection.rating
                            ? "bg-[#10b981]/20 text-[#10b981]"
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Observacoes (opcional)"
                  value={inspection.notes}
                  onChange={(e) =>
                    handleInspectionChange(index, "notes", e.target.value)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-[#52525b] focus:outline-none focus:border-[#10b981]/50 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-3">Fotos da Vistoria</h2>
          <p className="text-xs text-slate-500 mb-3">
            Adicione fotos relevantes para cada categoria
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(e.target.files)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#10b981]/20 file:text-[#10b981] file:text-sm file:font-medium hover:file:bg-[#10b981]/30 transition-colors"
          />
          {photos && photos.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {photos.length} foto(s) selecionada(s)
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-3">
            Preco Proposto pelo Consultor
          </h2>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              Kz
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm text-slate-800 placeholder-[#52525b] focus:outline-none focus:border-[#10b981]/50 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#10b981] text-[#060608] py-3 rounded-xl font-semibold text-sm hover:bg-[#0ea573] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "A submeter..." : "Submeter Vistoria"}
        </button>
      </div>
    </div>
  );
}
