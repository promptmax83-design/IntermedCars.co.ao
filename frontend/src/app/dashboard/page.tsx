'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Negotiation } from '@/lib/api';
import Header from '@/components/Header';
import StepIndicator from '@/components/StepIndicator';

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  aguardando_vistoria: { label: 'Aguardando Vistoria', color: 'bg-yellow-100 text-yellow-800', icon: '🔍' },
  vistoriado: { label: 'Vistoriado', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  aguardando_pagamento_taxas: { label: 'Pagamento das Taxas', color: 'bg-orange-100 text-orange-800', icon: '💰' },
  taxas_pagas: { label: 'Taxas Pagas', color: 'bg-green-100 text-green-800', icon: '✅' },
  concluido: { label: 'Concluido', color: 'bg-green-100 text-green-800', icon: '🎉' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: '❌' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .getNegotiations()
      .then(setNegotiations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Negociacoes</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {negotiations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma negociacao ainda</h2>
            <p className="text-gray-600 mb-6">
              Comece explorando os veiculos disponiveis na plataforma.
            </p>
            <Link
              href="/vehicles"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition inline-block"
            >
              Ver Veiculos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {negotiations.map((neg) => {
              const status = STATUS_MAP[neg.status] || {
                label: neg.status,
                color: 'bg-gray-100 text-gray-800',
                icon: '❓',
              };

              return (
                <div
                  key={neg.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{status.icon}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Negociacao #{neg.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Veiculo #{neg.vehicle_id}
                        {neg.final_car_price_aoa > 0 && (
                          <> — {formatCurrency(neg.final_car_price_aoa)}</>
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {neg.status === 'aguardando_pagamento_taxas' && (
                        <Link
                          href={`/payment/${neg.id}`}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
                        >
                          💰 Pagar Taxas
                        </Link>
                      )}
                      {neg.status === 'taxas_pagas' && (
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                          ✅ Aguardando Entrega
                        </span>
                      )}
                      <Link
                        href={`/negotiation/${neg.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                      >
                        Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
