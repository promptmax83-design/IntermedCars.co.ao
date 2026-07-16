'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Home() {
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);

  useEffect(() => {
    api.healthCheck().then(setHealth).catch(console.error);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IC</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">IntermedCars</h1>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800 transition"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Compre e Venda Carros em Angola
            <span className="text-blue-600"> com Seguranca</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma de intermedicao que protege comprador e vendedor.
            Pagamento via Multicaixa, vistoria por consultores certificados
            e contratos digitais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Comecar Agora
            </Link>
            <Link
              href="/vehicles"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg border-2 border-blue-200 hover:border-blue-400 transition"
            >
              Ver Veiculos
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Protecao Total</h3>
            <p className="text-gray-600">
              O dinheiro so e transferido apos a confirmacao de entrega do veiculo.
              Taxa de intermediacao via Multicaixa.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Vistoria Profissional</h3>
            <p className="text-gray-600">
              Consultores certificados realizam vistoria completa do veiculo
              antes de fechar o negocio.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Contrato Digital</h3>
            <p className="text-gray-600">
              Contrato gerado automaticamente com todos os detalhes da transacao.
              Assinatura digital de ambas as partes.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'Cadastro', desc: 'Crie sua conta gratuita' },
              { step: '2', title: 'Selecao', desc: 'Escolha o veiculo desejado' },
              { step: '3', title: 'Vistoria', desc: 'Consultor verifica o carro' },
              { step: '4', title: 'Pagamento', desc: 'Taxas via Multicaixa' },
              { step: '5', title: 'Entrega', desc: 'Combine e confirme' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2026 IntermedCars. Todos os direitos reservados.
          </p>
          {health && (
            <p className="text-sm text-gray-500 mt-2">
              API v{health.version} | Status: {health.status}
            </p>
          )}
        </div>
      </footer>
    </main>
  );
}
