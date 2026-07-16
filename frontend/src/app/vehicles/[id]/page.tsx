'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Vehicle } from '@/lib/api';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = Number(params.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [negotiating, setNegotiating] = useState(false);
  const [negotiationMsg, setNegotiationMsg] = useState('');

  const fetchVehicle = useCallback(async () => {
    try {
      const data = await api.getVehicle(vehicleId);
      setVehicle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const startNegotiation = async () => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setNegotiating(true);
    setNegotiationMsg('');
    try {
      const result = await api.createNegotiation(vehicleId, 'Luanda');
      if (result.success) {
        setNegotiationMsg('Negociacao criada! Consultor atribuido.');
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err: any) {
      setNegotiationMsg(err.message || 'Erro ao criar negociacao');
    } finally {
      setNegotiating(false);
    }
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(value);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Veiculo nao encontrado</h2>
          <p className="text-gray-600 mb-4">{error || 'Nao foi possivel carregar o veiculo.'}</p>
          <Link href="/vehicles" className="text-blue-600 font-medium hover:text-blue-800">
            Voltar aos Veiculos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/vehicles" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <span>←</span>
            <span>Voltar aos Veiculos</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Vehicle Image Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-72 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-8xl">🚗</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  vehicle.status === 'disponivel'
                    ? 'bg-green-100 text-green-800'
                    : vehicle.status === 'em_negociacao'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {vehicle.status === 'disponivel' ? 'Disponivel' : vehicle.status === 'em_negociacao' ? 'Em Negociacao' : vehicle.status}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.marca} {vehicle.modelo}
              </h1>

              <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                <span>{vehicle.ano}</span>
                {vehicle.cor && <span>• {vehicle.cor}</span>}
                {vehicle.km && <span>• {vehicle.km.toLocaleString()} km</span>}
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-6">
                {vehicle.preco ? formatPrice(vehicle.preco) : 'Sob consulta'}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {vehicle.marca && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase">Marca</p>
                    <p className="font-semibold">{vehicle.marca}</p>
                  </div>
                )}
                {vehicle.modelo && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase">Modelo</p>
                    <p className="font-semibold">{vehicle.modelo}</p>
                  </div>
                )}
                {vehicle.ano && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase">Ano</p>
                    <p className="font-semibold">{vehicle.ano}</p>
                  </div>
                )}
                {vehicle.cor && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase">Cor</p>
                    <p className="font-semibold">{vehicle.cor}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-3">Descricao</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Interessado neste veiculo?</h2>
              <p className="text-gray-600 text-sm mb-4">
                Inicie uma negociacao e um consultor local sera atribuido para acompanhar todo o processo.
              </p>

              {negotiationMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  negotiationMsg.includes('criada')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {negotiationMsg}
                </div>
              )}

              <button
                onClick={startNegotiation}
                disabled={negotiating || vehicle.status !== 'disponivel'}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {negotiating ? 'Criando...' : vehicle.status === 'disponivel' ? 'Iniciar Negociacao' : 'Veiculo Indisponivel'}
              </button>
            </div>

            {/* How it works mini */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Como funciona</h2>
              <div className="space-y-3">
                {[
                  { icon: '📋', text: 'Voce inicia a negociacao' },
                  { icon: '🔍', text: 'Consultor faz vistoria' },
                  { icon: '💰', text: 'Taxas pagas via Multicaixa' },
                  { icon: '✅', text: 'Entrega confirmada' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Taxas de Intermediacao</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Comprador: 3% do valor do carro</li>
                <li>• Vendedor: 5% do valor do carro</li>
                <li>• Pagamento via Multicaixa Express</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
