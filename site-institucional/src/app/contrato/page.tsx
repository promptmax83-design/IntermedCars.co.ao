"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Negotiation {
  id: number;
  status: string;
  vehicle_id: number;
  created_at: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  mileage: number;
}

interface Financial {
  agreed_price: number;
  commission_percentage: number;
  commission_value: number;
  total_taxes: number;
  net_value: number;
}

interface NegotiationDetail {
  id: number;
  status: string;
  vehicle_id: number;
  buyer?: { id: number; name: string; email: string; phone: string };
  seller?: { id: number; name: string; email: string; phone: string };
  consultant?: { id: number; name: string; email: string };
  vehicle?: Vehicle;
  created_at: string;
}

export default function ContratoPage() {
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get("negotiation");

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [negotiation, setNegotiation] = useState<NegotiationDetail | null>(
    null
  );
  const [financial, setFinancial] = useState<Financial | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (negotiationId) {
          const [negRes, finRes] = await Promise.all([
            fetch(`${API_BASE}/api/negotiations/${negotiationId}`),
            fetch(`${API_BASE}/api/negotiations/${negotiationId}/financial`),
          ]);

          if (!negRes.ok) throw new Error("Erro ao carregar negociacao");
          const negData = await negRes.json();
          if (cancelled) return;
          setNegotiation(negData);

          if (finRes.ok) {
            const finData = await finRes.json();
            if (!cancelled) setFinancial(finData);
          }

          if (negData.vehicle_id) {
            const vRes = await fetch(
              `${API_BASE}/api/vehicles/${negData.vehicle_id}`
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">A carregar contrato...</p>
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
                Promise.all([
                  fetch(`${API_BASE}/api/negotiations/${negotiationId}`),
                  fetch(
                    `${API_BASE}/api/negotiations/${negotiationId}/financial`
                  ),
                ])
                  .then(([negRes, finRes]) =>
                    Promise.all([negRes.json(), finRes.ok ? finRes.json() : null])
                  )
                  .then(([negData, finData]) => {
                    setNegotiation(negData);
                    if (finData) setFinancial(finData);
                    if (negData.vehicle_id) {
                      return fetch(
                        `${API_BASE}/api/vehicles/${negData.vehicle_id}`
                      ).then((r) => r.json().then(setVehicle));
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
            <h1 className="text-2xl font-bold text-slate-800">Contrato</h1>
            <p className="text-sm text-slate-500">
              Selecione uma negociacao para gerar o contrato
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {negotiations.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                Nenhuma negociacao encontrada.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {negotiations.map((n) => (
                <Link
                  key={n.id}
                  href={`/contrato?negotiation=${n.id}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Negociacao #{n.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        Viatura ID: {n.vehicle_id}
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

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedPrice = financial
    ? financial.agreed_price.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
      })
    : "—";

  const formattedCommission = financial
    ? financial.commission_value.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
      })
    : "—";

  const formattedNet = financial
    ? financial.net_value.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
      })
    : "—";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 print:bg-white print:max-w-none print:px-0">
        <div className="print:hidden flex items-center gap-2">
          <Link
            href="/contrato"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Voltar
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden print:bg-white print:border-gray-200">
          <div className="bg-slate-50 p-6 text-center print:bg-white">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 print:text-gray-500">
              Contrato de Compra e Venda
            </p>
            <p className="font-bold text-lg text-slate-800 print:text-gray-900">
              IntermedCars
            </p>
            <p className="text-xs text-slate-400 mt-1 print:text-gray-400">
              Ref: IC-{now.getFullYear()}-
              {String(negotiationId).padStart(4, "0")}
            </p>
          </div>

          <div className="p-6 space-y-5 text-sm print:text-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-3 print:bg-gray-50 print:border print:border-gray-200">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider print:text-gray-400">
                  Vendedor
                </p>
                <p className="font-medium text-slate-800 mt-0.5 print:text-gray-900">
                  {negotiation?.seller?.name || "—"}
                </p>
                {negotiation?.seller?.email && (
                  <p className="text-xs text-slate-500 mt-0.5 print:text-gray-500">
                    {negotiation.seller.email}
                  </p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 print:bg-gray-50 print:border print:border-gray-200">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider print:text-gray-400">
                  Comprador
                </p>
                <p className="font-medium text-slate-800 mt-0.5 print:text-gray-900">
                  {negotiation?.buyer?.name || "—"}
                </p>
                {negotiation?.buyer?.email && (
                  <p className="text-xs text-slate-500 mt-0.5 print:text-gray-500">
                    {negotiation.buyer.email}
                  </p>
                )}
              </div>
            </div>

            {vehicle && (
              <div className="bg-slate-50 rounded-xl p-4 print:bg-gray-50 print:border print:border-gray-200">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 print:text-gray-400">
                  Dados da Viatura
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 print:text-gray-500">
                      Marca / Modelo
                    </p>
                    <p className="font-medium text-slate-800 print:text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 print:text-gray-500">
                      Ano
                    </p>
                    <p className="font-medium text-slate-800 print:text-gray-900">
                      {vehicle.year}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 print:text-gray-500">
                      Cor
                    </p>
                    <p className="font-medium text-slate-800 print:text-gray-900">
                      {vehicle.color}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 print:text-gray-500">
                      Matricula
                    </p>
                    <p className="font-medium text-slate-800 print:text-gray-900">
                      {vehicle.plate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 print:text-gray-500">
                      Quilometragem
                    </p>
                    <p className="font-medium text-slate-800 print:text-gray-900">
                      {vehicle.mileage.toLocaleString("pt-PT")} km
                    </p>
                  </div>
                </div>
              </div>
            )}

            {financial && (
              <div className="bg-slate-50 rounded-xl p-4 print:bg-gray-50 print:border print:border-gray-200">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 print:text-gray-400">
                  Valor e Taxas
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 print:text-gray-600">
                      Preco Acordado
                    </span>
                    <span className="font-bold text-[#10b981] text-lg print:text-emerald-600">
                      {formattedPrice} Kz
                    </span>
                  </div>
                  <div className="h-px bg-white/[0.06] print:bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 print:text-gray-600">
                      Comissao IntermedCars (
                      {financial.commission_percentage}%)
                    </span>
                    <span className="font-medium text-slate-800 print:text-gray-900">
                      {formattedCommission} Kz
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 print:text-gray-600">
                      Taxas Adicionais (3%)
                    </span>
                    <span className="font-medium text-slate-800 print:text-gray-900">
                      {financial.total_taxes.toLocaleString("pt-PT", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      Kz
                    </span>
                  </div>
                  <div className="h-px bg-white/[0.06] print:bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 print:text-gray-600">
                      Valor Liquido ao Vendedor
                    </span>
                    <span className="font-bold text-slate-800 print:text-gray-900">
                      {formattedNet} Kz
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 print:bg-gray-50 print:border print:border-gray-200">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 print:text-gray-400">
                Condicoes Gerais
              </p>
              <ul className="text-slate-500 space-y-1.5 text-xs leading-relaxed print:text-gray-600">
                <li>
                  1. O pagamento sera efetuado via cofre fiduciario
                  IntermedCards ou transferencia bancaria.
                </li>
                <li>
                  2. A entrega do veiculo sera realizada em ate 5 dias uteis
                  apos a confirmacao do pagamento.
                </li>
                <li>
                  3. O veiculo sera entregue com documentacao completa e
                  vistoria realizada pela IntermedCards.
                </li>
                <li>
                  4. A IntermedCards atua como mediadora entre as partes, nao
                  se responsabilizando por vicios ocultos.
                </li>
                <li>
                  5. O presente contrato e regido pela legislacao angolana
                  vigente.
                </li>
              </ul>
            </div>

            {negotiation?.consultant && (
              <div className="bg-slate-50 rounded-xl p-3 print:bg-gray-50 print:border print:border-gray-200">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider print:text-gray-400">
                  Consultor Responsavel
                </p>
                <p className="font-medium text-slate-800 mt-0.5 print:text-gray-900">
                  {negotiation.consultant.name}
                </p>
                <p className="text-xs text-slate-500 print:text-gray-500">
                  {negotiation.consultant.email}
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3 print:bg-gray-50 print:border print:border-gray-200">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider print:text-gray-400">
                Data e Local
              </p>
              <p className="font-medium text-slate-800 mt-0.5 print:text-gray-900">
                Luanda, {dateStr}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 print:bg-white print:border-gray-200">
          <h2 className="font-bold text-slate-800 mb-4 print:text-gray-900">
            Assinaturas
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="h-20 border-b border-slate-200 print:border-gray-300 mb-2" />
              <p className="text-xs font-medium text-slate-800 print:text-gray-900">
                {negotiation?.buyer?.name || "Comprador"}
              </p>
              <p className="text-[10px] text-slate-500 print:text-gray-500">
                Comprador
              </p>
            </div>
            <div className="text-center">
              <div className="h-20 border-b border-slate-200 print:border-gray-300 mb-2" />
              <p className="text-xs font-medium text-slate-800 print:text-gray-900">
                {negotiation?.seller?.name || "Vendedor"}
              </p>
              <p className="text-[10px] text-slate-500 print:text-gray-500">
                Vendedor
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#10b981] text-[#060608] py-3 rounded-xl font-semibold text-sm hover:bg-[#0ea573] transition-colors"
          >
            Imprimir Contrato
          </button>
        </div>
      </div>
    </div>
  );
}
