'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function NegotiationPage() {
  const params = useParams();
  const router = useRouter();
  const negotiationId = Number(params.id);

  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNegotiation = useCallback(async () => {
    try {
      const neg = await api.getNegotiation(negotiationId);
      setNegotiation(neg);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [negotiationId]);

  useEffect(() => {
    fetchNegotiation();
  }, [fetchNegotiation]);

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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (error || !negotiation) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Negociacao nao encontrada</h2>
          <p className="text-gray-600 mb-4">{error || 'Nao foi possivel carregar a negociacao.'}</p>
          <Link href="/dashboard" className="text-blue-600 font-medium hover:text-blue-800">
            Voltar ao Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const status = STATUS_MAP[negotiation.status] || {
    label: negotiation.status,
    color: 'bg-gray-100 text-gray-800',
    icon: '❓',
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{status.icon}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Negociacao #{negotiationId}
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Veiculo</span>
              <span className="font-medium">#{negotiation.vehicle_id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Vendedor</span>
              <span className="font-medium">#{negotiation.seller_id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Comprador</span>
              <span className="font-medium">#{negotiation.buyer_id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Consultor</span>
              <span className="font-medium">#{negotiation.consultant_id}</span>
            </div>
            {negotiation.final_car_price_aoa > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Preco Final</span>
                <span className="font-bold text-lg">{formatCurrency(negotiation.final_car_price_aoa)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons based on status */}
        {negotiation.status === 'aguardando_pagamento_taxas' && (
          <Link
            href={`/payment/${negotiationId}`}
            className="block w-full py-4 bg-orange-600 text-white rounded-xl font-semibold text-center hover:bg-orange-700 transition"
          >
            💰 Pagar Taxas de Intermediacao
          </Link>
        )}

        {negotiation.status === 'taxas_pagas' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-green-800 mb-2">Taxas Pagas</h3>
            <p className="text-green-700">
              Ambas as partes pagaram as suas taxas. Aguarde a confirmacao da entrega do veiculo.
            </p>
          </div>
        )}

        {negotiation.status === 'concluido' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold text-green-800 mb-2">Negociacao Concluida!</h3>
            <p className="text-green-700">
              A transacao foi finalizada com sucesso. Parabens!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
