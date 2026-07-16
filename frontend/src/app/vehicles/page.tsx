'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Vehicle } from '@/lib/api';

const MARCAS = ['Toyota', 'Hyundai', 'Kia', 'Nissan', 'Honda', 'Mazda', 'Ford', 'Volkswagen', 'Mercedes', 'BMW', 'Chevrolet', 'Suzuki'];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMarca, setFilterMarca] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchSearch = !search ||
      v.marca.toLowerCase().includes(search.toLowerCase()) ||
      String(v.modelo).toLowerCase().includes(search.toLowerCase());
    const matchMarca = !filterMarca || v.marca === filterMarca;
    return matchSearch && matchMarca;
  });

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(value);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">IC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">IntermedCars</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/vehicles" className="text-blue-600 font-medium">
                Veiculos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Veiculos Disponiveis</h1>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pesquisar por marca ou modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterMarca}
              onChange={(e) => setFilterMarca(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as marcas</option>
              {MARCAS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando veiculos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum veiculo encontrado</h2>
            <p className="text-gray-600">
              {search || filterMarca ? 'Tente outros filtros.' : 'Ainda nao ha veiculos cadastrados.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition">🚗</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      vehicle.status === 'disponivel'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'em_negociacao'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.status === 'disponivel' ? 'Disponivel' : vehicle.status === 'em_negociacao' ? 'Em Negociacao' : vehicle.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>
                  <p className="text-sm text-gray-500">{vehicle.ano} {vehicle.cor && `• ${vehicle.cor}`}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {vehicle.preco ? formatPrice(vehicle.preco) : 'Sob consulta'}
                    </span>
                    <span className="text-sm text-gray-400">Ver detalhes →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
