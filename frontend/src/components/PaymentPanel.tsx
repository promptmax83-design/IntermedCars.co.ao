'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface PaymentPanelProps {
  negotiationId: number;
  role: 'buyer' | 'seller';
  amount: number;
  paymentRef: string;
  onPaymentConfirmed?: () => void;
}

type Status = 'idle' | 'generating' | 'pending' | 'paid' | 'error';

export default function PaymentPanel({
  negotiationId,
  role,
  amount,
  paymentRef: initialRef,
  onPaymentConfirmed,
}: PaymentPanelProps) {
  const [status, setStatus] = useState<Status>(initialRef ? 'pending' : 'idle');
  const [paymentRef, setPaymentRef] = useState(initialRef);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [generating, setGenerating] = useState(false);

  const ENTITY = '00060';

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentRef || status !== 'pending') return;
    try {
      const result = await api.getMulticaixaPayment(paymentRef);
      if (result.status === 'paid' || result.status === 'confirmado' || result.status === 'accepted') {
        setStatus('paid');
        onPaymentConfirmed?.();
      }
    } catch {
      // continue polling
    }
  }, [paymentRef, status, onPaymentConfirmed]);

  // Polling: check payment every 5 seconds
  useEffect(() => {
    if (status !== 'pending' || !paymentRef) return;
    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [status, paymentRef, checkPaymentStatus]);

  const generatePayment = async () => {
    if (!phone) {
      setError('Insira o seu numero de telemovel');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const result = await api.createMulticaixaPayment(negotiationId, role, phone, amount);
      if (result.success && result.transaction_id) {
        setPaymentRef(result.transaction_id);
        setStatus('pending');
      } else {
        setError(result.message || 'Erro ao gerar pagamento');
        setStatus('idle');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar pagamento');
      setStatus('idle');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);

  const roleLabel = role === 'buyer' ? 'Comprador' : 'Vendedor';
  const feeLabel = role === 'buyer' ? 'Taxa de Protecao ao Comprador (3%)' : 'Taxa de Servico do Vendedor (5%)';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">{feeLabel}</p>
            <p className="text-blue-300 text-xs mt-1">Pagador: {roleLabel}</p>
            <h2 className="text-3xl font-bold mt-1">{formatCurrency(amount)}</h2>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">💳</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* PENDING: Show entity + reference */}
        {status === 'pending' && paymentRef && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Pague via Multicaixa Express ou Internet Banking utilizando os dados abaixo:
            </p>

            {/* Entity */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entidade</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-mono font-bold text-center tracking-widest">
                  {ENTITY}
                </div>
                <button
                  onClick={() => copyToClipboard(ENTITY)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-sm font-medium"
                >
                  {copied ? '✓' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Reference */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Referencia</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xl font-mono font-bold text-center tracking-wider">
                  {paymentRef}
                </div>
                <button
                  onClick={() => copyToClipboard(paymentRef)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-sm font-medium"
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Valor (AOA)</label>
              <div className="mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-mono font-bold text-center text-green-600">
                {formatCurrency(amount)}
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-xl">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-green"></div>
              <span className="text-blue-700 font-medium">Aguardando confirmacao do pagamento...</span>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              O sistema verifica automaticamente. Nao e necessario atualizar a pagina.
            </p>
          </>
        )}

        {/* PAID: Success state */}
        {status === 'paid' && (
          <div className="text-center py-8 animate-slide-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🛡️</span>
            </div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Pagamento Confirmado!</h3>
            <p className="text-gray-600">A taxa foi paga com sucesso. "Sinal Verde" ativado.</p>
          </div>
        )}

        {/* IDLE: Generate payment form */}
        {status === 'idle' && (
          <>
            <div className="text-center py-4 mb-4">
              <div className="text-5xl mb-3">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gerar Referencia de Pagamento</h3>
              <p className="text-gray-600 text-sm">
                Insira o seu numero Multicaixa Express para receber a notificacao de pagamento.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Telemovel Multicaixa</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="912 345 678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={generatePayment}
              disabled={generating || !phone}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {generating ? 'Gerando...' : 'Gerar Referencia Multicaixa'}
            </button>
          </>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Erro no Pagamento</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => { setStatus('idle'); setError(''); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
