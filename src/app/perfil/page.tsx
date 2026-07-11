"use client";
import { useState } from "react";

const badges = [
  { icono: "🏆", nome: "Primeira Venda", desbloqueado: true },
  { icono: "💯", nome: "100 Negócios", desbloqueado: true },
  { icono: "⭐", nome: "Top Agente", desbloqueado: true },
  { icono: "🤝", nome: "Negociação Perfeita", desbloqueado: true },
  { icono: "🏅", nome: "Cliente Ouro", desbloqueado: false },
  { icono: "👑", nome: "Embaixador", desbloqueado: false },
];

const inventario = [
  { marca: "BMW", modelo: "Serie 5", preco: "42.900", estado: "Ativo" },
  { marca: "Audi", modelo: "Q5", preco: "49.900", estado: "Ativo" },
  { marca: "Mercedes", modelo: "Classe C", preco: "38.500", estado: "Vendido" },
];

const avaliacoes = [
  {
    de: "Ricardo M.",
    texto: "Excelente agente! Muito profissional e atencioso.",
    rating: 5,
    data: "05/07/2026",
  },
  {
    de: "Sofia A.",
    texto: "Negociação rápida e transparente. Recomendo!",
    rating: 5,
    data: "01/07/2026",
  },
  {
    de: "Pedro S.",
    texto: "Muito bom profissional. Tratou de tudo.",
    rating: 4,
    data: "28/06/2026",
  },
];

export default function PerfilPage() {
  const [tab, setTab] = useState("inventario");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary via-secondary to-primary relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-accent rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-primary text-2xl font-bold">JF</span>
            </div>
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">João Ferreira</h1>
            <span className="text-accent">✓</span>
          </div>
          <p className="text-sm text-muted">Agente Certificado · Lisboa</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-accent text-sm">★★★★★</span>
            <span className="text-sm text-muted">(243 avaliações)</span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">
              Nível Prata
            </span>
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
              98.4% Sucesso
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-light rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-accent">142</p>
              <p className="text-[10px] text-muted">Transações</p>
            </div>
            <div className="bg-light rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-accent">23</p>
              <p className="text-[10px] text-muted">Este Mês</p>
            </div>
            <div className="bg-light rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-accent">#5</p>
              <p className="text-[10px] text-muted">Ranking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {["inventario", "avaliações", "badges", "histórico"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${tab === t ? "bg-primary text-white" : "text-muted hover:bg-light"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "inventario" && (
        <div className="space-y-3">
          {inventario.map((item) => (
            <div
              key={`${item.marca}-${item.modelo}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-light rounded-lg flex items-center justify-center text-xl">
                  🚗
                </div>
                <div>
                  <p className="text-xs text-accent font-semibold">
                    {item.marca}
                  </p>
                  <p className="font-medium text-sm">{item.modelo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">{item.preco}€</p>
                <p
                  className={`text-[10px] font-medium ${item.estado === "Vendido" ? "text-green-500" : "text-amber-500"}`}
                >
                  {item.estado}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "avaliações" && (
        <div className="space-y-3">
          {avaliacoes.map((a, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-accent text-xs font-bold">
                    {a.de
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <p className="font-medium text-sm">{a.de}</p>
                </div>
                <span className="text-xs text-muted">{a.data}</span>
              </div>
              <p className="text-accent text-sm">
                {"★".repeat(a.rating)}
                {"☆".repeat(5 - a.rating)}
              </p>
              <p className="text-sm text-muted mt-1">{a.texto}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "badges" && (
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.nome}
              className={`bg-white rounded-xl p-4 shadow-sm border text-center ${b.desbloqueado ? "border-accent" : "border-gray-100 opacity-40"}`}
            >
              <span className="text-3xl">{b.icono}</span>
              <p className="text-xs font-medium mt-2">{b.nome}</p>
              {b.desbloqueado && (
                <p className="text-[10px] text-accent mt-1">Desbloqueado</p>
              )}
              {!b.desbloqueado && (
                <p className="text-[10px] text-muted mt-1">Bloqueado</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "histórico" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center text-muted text-sm">
          Histórico completo de transações aqui.
        </div>
      )}
    </div>
  );
}
