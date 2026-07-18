"use client";
import { useState } from "react";

const bancos = [
  { nome: "CGD", taxa: "4.2%", prazo: "60 meses", prestacao: "789Kz" },
  { nome: "BPI", taxa: "3.9%", prazo: "60 meses", prestacao: "772Kz" },
  { nome: "Millennium", taxa: "4.0%", prazo: "60 meses", prestacao: "778Kz" },
  { nome: "Santander", taxa: "4.1%", prazo: "60 meses", prestacao: "783Kz" },
];

export default function FinanciamentoPage() {
  const [preco, setPreco] = useState(42900);
  const [entrada, setEntrada] = useState(8580);
  const [prazo, setPrazo] = useState(60);

  const financiavel = preco - entrada;
  const prestacaoBase = financiavel / prazo;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financiamento</h1>
          <p className="text-sm text-slate-500">
            Simule o financiamento da sua viatura.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Preço da Viatura
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                Kz
              </span>
              <input
                type="number"
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Entrada
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                Kz
              </span>
              <input
                type="number"
                value={entrada}
                onChange={(e) => setEntrada(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mínimo: 20% ({(preco * 0.2).toLocaleString()}Kz)
            </p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Prazo
            </label>
            <div className="flex gap-2 mt-1">
              {[24, 36, 48, 60].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrazo(p)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    p === prazo
                      ? "bg-[#10b981] text-[#060608] font-semibold"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {p} meses
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#10b981] rounded-2xl p-6 text-[#060608]">
          <p className="text-sm font-medium opacity-70">Prestação Estimada</p>
          <p className="text-4xl font-bold mt-1">
            {prestacaoBase.toFixed(0)}Kz
            <span className="text-lg opacity-70">/mês</span>
          </p>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <p className="opacity-70">Financiável</p>
              <p className="font-bold">{financiavel.toLocaleString()}Kz</p>
            </div>
            <div>
              <p className="opacity-70">Total a pagar</p>
              <p className="font-bold">
                {(prestacaoBase * prazo).toFixed(0).toLocaleString()}Kz
              </p>
            </div>
            <div>
              <p className="opacity-70">MTIC</p>
              <p className="font-bold">
                {(prestacaoBase * prazo + entrada).toFixed(0).toLocaleString()}Kz
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-slate-800 mb-3">Melhores Ofertas</h2>
          <div className="space-y-3">
            {bancos.map((b) => (
              <div
                key={b.nome}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-bold text-slate-800">{b.nome}</p>
                  <p className="text-xs text-slate-500">
                    Taxa: {b.taxa} · {b.prazo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#10b981] font-bold text-lg">{b.prestacao}Kz</p>
                  <p className="text-[10px] text-slate-500">/mês</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-3">Adicionar Seguro</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Seguro Automóvel</p>
              <p className="text-xs text-slate-500">Cobertura completa · ~35Kz/mês</p>
            </div>
            <button className="w-12 h-7 bg-[#10b981] rounded-full relative">
              <span className="absolute right-0.5 top-0.5 w-6 h-6 bg-[#F8F9FA] rounded-full shadow-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
