"use client";
import { useState } from "react";

const itens = [
  {
    categoria: "Motor",
    items: [
      "Estado geral",
      "Níveis de líquidos",
      "Filtros",
      "Correias",
      "Ruídos anormais",
    ],
    fotos: 2,
  },
  {
    categoria: "Travões",
    items: ["Pastilhas", "Discos", "Líquido de travões", "Funcionamento ABS"],
    fotos: 1,
  },
  {
    categoria: "Interior",
    items: [
      "Bancos",
      "Quadro de instrumentos",
      "Ar condicionado",
      "Eletrónica",
    ],
    fotos: 3,
  },
  {
    categoria: "Pintura",
    items: ["Estado geral", "Riscos", "Amolgaduras", "Pintura original"],
    fotos: 4,
  },
  {
    categoria: "Pneus",
    items: ["Desgaste", "Pressão", "Estado das paredes", "Ano de fabrico"],
    fotos: 2,
  },
  {
    categoria: "Suspensão",
    items: ["Amortecedores", "Molas", "Articulações", "Barulhos"],
    fotos: 1,
  },
];

export default function VistoriaPage() {
  const [expandido, setExpandido] = useState<string | null>("Motor");

  const totalFotos = itens.reduce((acc, i) => acc + i.fotos, 0);
  const totalItems = itens.reduce((acc, i) => acc + i.items.length, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vistoria</h1>
        <p className="text-sm text-muted">
          BMW Serie 5 530e · Checklist de inspeção
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Progresso da Vistoria</p>
            <p className="text-xs text-muted">
              {totalItems} itens · {totalFotos} fotos
            </p>
          </div>
          <p className="text-accent font-bold text-lg">6/6</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full"
            style={{ width: "100%" }}
          />
        </div>
        <div className="flex items-center gap-1 mt-3">
          <span className="text-emerald-500 text-sm">✓</span>
          <span className="text-xs text-emerald-600 font-medium">
            Vistoria concluída
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {itens.map((cat) => (
          <div
            key={cat.categoria}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandido(expandido === cat.categoria ? null : cat.categoria)
              }
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-sm">
                  ✓
                </span>
                <span className="font-medium text-sm">{cat.categoria}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{cat.fotos} fotos</span>
                <span
                  className={`text-xs transition-transform ${expandido === cat.categoria ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </div>
            </button>
            {expandido === cat.categoria && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                {cat.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-muted">{item}</span>
                    <span className="text-emerald-500 text-sm">✓ OK</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold mb-3">Fotos da Vistoria</h2>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: totalFotos }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-light rounded-lg flex items-center justify-center text-xl"
            >
              📷
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
