"use client";
import Link from "next/link";
import { useState } from "react";

const galeria = ["🚗", "🏎️", "🚙", "⚡", "🛞", "📷"];

const viatura = {
  id: 1,
  marca: "BMW",
  modelo: "Serie 5 530e M Sport",
  ano: "2023",
  preco: "42.900",
  km: "15.000",
  combustivel: "Híbrido Plug-in",
  caixa: "Automática 8 vel.",
  cor: "Preto Sapphire",
  potencia: "299 cv",
  tracao: "Traseira",
  portas: "5",
  lugares: "5",
  stand: "AutoPremium",
  agente: "Ana Rodrigues",
  trustScore: 98.5,
  local: "Lisboa, Portugal",
  descricao: "BMW Serie 5 530e M Sport em excelente estado. Equipada com pacote M Sport, navigador profissional, tetosolar panorâmico, câmaras 360° e assistente de estacionamento. Revisões em dia na marca.",
};

const proprietario = {
  nome: "AutoPremium",
  tipo: "Stand",
  rating: 4.9,
  avaliacoes: 127,
  vendas: 89,
  verificado: true,
};

export default function ViaturaPage() {
  const [imagemAtual, setImagemAtual] = useState(0);
  const [favoritado, setFavoritado] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">← Voltar ao Feed</Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setFavoritado(!favoritado)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${favoritado ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"}`}>
            {favoritado ? "♥" : "♡"}
          </button>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-foreground transition-colors">↗</button>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-foreground transition-colors">⚖</button>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-72 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <span className="text-8xl">{galeria[imagemAtual]}</span>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {galeria.map((_, i) => (
              <button key={i} onClick={() => setImagemAtual(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imagemAtual ? "bg-accent" : "bg-gray-300"}`} />
            ))}
          </div>
          <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{imagemAtual + 1}/{galeria.length}</span>
        </div>
        <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide">
          {galeria.map((img, i) => (
            <button key={i} onClick={() => setImagemAtual(i)} className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors ${i === imagemAtual ? "border-accent" : "border-transparent"}`}>
              <span className="text-2xl">{img}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-accent text-sm font-semibold">{viatura.marca}</p>
            <h1 className="text-2xl font-bold">{viatura.modelo}</h1>
            <p className="text-muted text-sm mt-1">📍 {viatura.local} · 🕐 Publicado há 3 dias</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-accent">{viatura.preco}€</p>
            <p className="text-xs text-muted">IVA incluído</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Ano", value: viatura.ano },
            { label: "Km", value: viatura.km },
            { label: "Combustível", value: viatura.combustivel },
            { label: "Caixa", value: viatura.caixa },
          ].map((item) => (
            <div key={item.label} className="bg-light rounded-lg p-3 text-center">
              <p className="text-[10px] text-muted uppercase">{item.label}</p>
              <p className="text-sm font-bold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Cor", value: viatura.cor },
            { label: "Potência", value: viatura.potencia },
            { label: "Tração", value: viatura.tracao },
            { label: "Lugares", value: viatura.lugares },
          ].map((item) => (
            <div key={item.label} className="bg-light rounded-lg p-3 text-center">
              <p className="text-[10px] text-muted uppercase">{item.label}</p>
              <p className="text-sm font-bold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        <p className="text-muted text-sm leading-relaxed">{viatura.descricao}</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Vendedor</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-accent font-bold">
            {proprietario.nome.slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold">{proprietario.nome}</p>
              {proprietario.verificado && <span className="text-accent text-sm">✓ Verificado</span>}
            </div>
            <p className="text-xs text-muted">{proprietario.tipo} · ★ {proprietario.rating} ({proprietario.avaliacoes} avaliações) · {proprietario.vendas} vendas</p>
          </div>
          <Link href="/stand/premium" className="text-sm text-accent font-medium">Ver perfil →</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Agente Responsável</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-primary font-bold">AR</div>
          <div className="flex-1">
            <p className="font-bold">Ana Rodrigues</p>
            <p className="text-xs text-muted">Agente Certificado · ★ 4.9 · 23 vendas este mês</p>
          </div>
          <Link href="/agente/ana" className="text-sm text-accent font-medium">Ver perfil →</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Vistoria</h2>
        <div className="grid grid-cols-2 gap-2">
          {["Motor ✓", "Travões ✓", "Interior ✓", "Pintura ✓", "Pneus ✓", "Suspensão ✓"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 flex gap-3">
        <Link href="/financiamento" className="flex-1 bg-white border border-gray-200 text-center py-3 rounded-xl font-medium text-sm hover:bg-light transition-colors">
          💳 Financiar
        </Link>
        <Link href="/chat" className="flex-1 bg-accent text-primary text-center py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-colors">
          💬 Iniciar Negociação
        </Link>
      </div>
    </div>
  );
}
