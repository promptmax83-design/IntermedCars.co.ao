"use client";
import { useState } from "react";

const bancos = [
  { nome: "CGD", taxa: "4.2%", prazo: "60 meses", prestacao: "789€" },
  { nome: "BPI", taxa: "3.9%", prazo: "60 meses", prestacao: "772€" },
  { nome: "Millennium", taxa: "4.0%", prazo: "60 meses", prestacao: "778€" },
  { nome: "Santander", taxa: "4.1%", prazo: "60 meses", prestacao: "783€" },
];

export default function FinanciamentoPage() {
  const [preco, setPreco] = useState(42900);
  const [entrada, setEntrada] = useState(8580);
  const [prazo, setPrazo] = useState(60);

  const financiavel = preco - entrada;
  const prestacaoBase = financiavel / prazo;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financiamento</h1>
        <p className="text-sm text-muted">
          Simule o financiamento da sua viatura.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <div>
          <label className="text-xs font-bold text-muted uppercase">
            Preço da Viatura
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              €
            </span>
            <input
              type="number"
              value={preco}
              onChange={(e) => setPreco(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 bg-light rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase">
            Entrada
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              €
            </span>
            <input
              type="number"
              value={entrada}
              onChange={(e) => setEntrada(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 bg-light rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <p className="text-xs text-muted mt-1">
            Mínimo: 20% ({(preco * 0.2).toLocaleString()}€)
          </p>
        </div>
        <div>
          <label className="text-xs font-bold text-muted uppercase">
            Prazo
          </label>
          <div className="flex gap-2 mt-1">
            {[24, 36, 48, 60].map((p) => (
              <button
                key={p}
                onClick={() => setPrazo(p)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${p === prazo ? "bg-primary text-white" : "bg-light text-gray-600"}`}
              >
                {p} meses
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-accent rounded-xl p-6 text-primary">
        <p className="text-sm font-medium opacity-70">Prestação Estimada</p>
        <p className="text-4xl font-bold mt-1">
          {prestacaoBase.toFixed(0)}€
          <span className="text-lg opacity-70">/mês</span>
        </p>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <p className="opacity-70">Financiável</p>
            <p className="font-bold">{financiavel.toLocaleString()}€</p>
          </div>
          <div>
            <p className="opacity-70">Total a pagar</p>
            <p className="font-bold">
              {(prestacaoBase * prazo).toFixed(0).toLocaleString()}€
            </p>
          </div>
          <div>
            <p className="opacity-70">MTIC</p>
            <p className="font-bold">
              {(prestacaoBase * prazo + entrada).toFixed(0).toLocaleString()}€
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-bold mb-3">Melhores Ofertas</h2>
        <div className="space-y-3">
          {bancos.map((b) => (
            <div
              key={b.nome}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="font-bold">{b.nome}</p>
                <p className="text-xs text-muted">
                  Taxa: {b.taxa} · {b.prazo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-accent font-bold text-lg">{b.prestacao}€</p>
                <p className="text-[10px] text-muted">/mês</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">Adicionar Seguro</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Seguro Automóvel</p>
            <p className="text-xs text-muted">Cobertura completa · ~35€/mês</p>
          </div>
          <button className="w-12 h-7 bg-accent rounded-full relative">
            <span className="absolute right-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
