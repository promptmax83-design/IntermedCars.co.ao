'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Negotiation } from '@/lib/api';
import Header from '@/components/Header';
import PaymentPanel from '@/components/PaymentPanel';
import StepIndicator from '@/components/StepIndicator';

interface FinancialSummary {
  vehicle_price: number;
  buyer_fee: number;
  seller_fee: number;
  consultant_commission: number;
  platform_revenue: number;
  consultant_share_pct: number;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const negotiationId = Number(params.id);

  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNegotiation = useCallback(async () => {
    try {
      const token = api.getToken();
      if (!token) { router.push('/login'); return; }

      const neg = await api.getNegotiation(negotiationId);
      setNegotiation(neg);

      try {
        const fin = await api.getFinancialSummary(negotiationId);
        setFinancial(fin);
      } catch {
        // financial summary might not be available yet
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [negotiationId, router]);

  useEffect(() => {
    fetchNegotiation();
  }, [fetchNegotiation]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando detalhes do pagamento...</p>
        </div>
      </main>
    );
  }

  if (error || !negotiation) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error || 'Negociacao nao encontrada'}</p>
          <Link href="/dashboard" className="text-blue-600 font-medium hover:text-blue-800">
            Voltar ao Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // Determine role and amount from negotiation
  const role: 'buyer' | 'seller' = negotiation.has_buyer_paid_fee ? 'seller' : 'buyer';
  const paymentRef = role === 'buyer' ? negotiation.buyer_payment_ref : negotiation.seller_payment_ref;
  const paymentAmount = role === 'buyer' ? negotiation.commission_buyer_aoa : negotiation.commission_seller_aoa;

  // Steps for the indicator
  const steps = [
    { label: 'Consulta', done: true },
    { label: 'Vistoria', done: ['vistoriado', 'aguardando_pagamento_taxas', 'taxas_pagas', 'concluido'].includes(negotiation.status) },
    { label: 'Pagamento', done: ['taxas_pagas', 'concluido'].includes(negotiation.status), current: negotiation.status === 'aguardando_pagamento_taxas' },
    { label: 'Entrega', done: negotiation.status === 'concluido' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Step indicator */}
        <div className="mb-6">
          <StepIndicator steps={steps} />
        </div>

        {/* Payment Panel (core component) */}
        {negotiation.status === 'aguardando_pagamento_taxas' && (
          <PaymentPanel
            negotiationId={negotiationId}
            role={role}
            amount={paymentAmount}
            paymentRef={paymentRef}
            onPaymentConfirmed={fetchNegotiation}
          />
        )}

        {/* Already paid */}
        {negotiation.status === 'taxas_pagas' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center animate-slide-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛡️</span>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Sinal Verde!</h2>
            <p className="text-green-700 mb-6">
              Ambas as partes pagaram as suas taxas. O negocio pode ser concluido.
            </p>
            <Link
              href={`/negotiation/${negotiationId}`}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition inline-block"
            >
              Ver Detalhes da Negociacao
            </Link>
          </div>
        )}

        {/* Completed */}
        {negotiation.status === 'concluido' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Negocio Concluido!</h2>
            <p className="text-green-700">A transacao foi finalizada com sucesso.</p>
          </div>
        )}

        {/* Financial Summary */}
        {financial && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Preco do Veiculo</span>
                <span className="font-semibold">{formatCurrency(financial.vehicle_price || negotiation.final_car_price_aoa || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Taxa Comprador (3%)</span>
                <span className="font-semibold text-orange-600">{formatCurrency(financial.buyer_fee || negotiation.commission_buyer_aoa || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Taxa Vendedor (5%)</span>
                <span className="font-semibold text-orange-600">{formatCurrency(financial.seller_fee || negotiation.commission_seller_aoa || 0)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Taxas (8%)</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency((financial.buyer_fee || 0) + (financial.seller_fee || 0) || negotiation.total_fees_collected_aoa || 0)}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> O valor do veiculo e transacionado diretamente entre comprador e vendedor.
                A plataforma so recebe as taxas de intermediacao.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
