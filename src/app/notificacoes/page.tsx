"use client";
import { useState } from "react";

const categorias = [
  "Todas",
  "Negociações",
  "Pagamentos",
  "Mensagens",
  "Sistema",
  "Promoções",
  "Segurança",
];

const notificacoes = [
  {
    categoria: "Negociações",
    titulo: "Proposta aceite",
    descricao: "Carlos Mendes aceitou a proposta de 41.500€ para o BMW Serie 5",
    hora: "5 min",
    lida: false,
  },
  {
    categoria: "Mensagens",
    titulo: "Nova mensagem de Ana Rodrigues",
    descricao: "Enviei a proposta de 41.500€",
    hora: "15 min",
    lida: false,
  },
  {
    categoria: "Pagamentos",
    titulo: "Pagamento recebido",
    descricao: "Transferência de 41.500€ confirmada no cofre fiduciário",
    hora: "1h",
    lida: false,
  },
  {
    categoria: "Sistema",
    titulo: "Vistoria concluída",
    descricao: "A vistoria do Audi Q5 foi finalizada com sucesso",
    hora: "3h",
    lida: true,
  },
  {
    categoria: "Negociações",
    titulo: "Contrato pronto",
    descricao: "O contrato do Porsche Macan está pronto para assinatura",
    hora: "5h",
    lida: true,
  },
  {
    categoria: "Segurança",
    titulo: "Login de novo dispositivo",
    descricao: "Detetámos um login de um iPhone em Lisboa",
    hora: "Ontem",
    lida: true,
  },
  {
    categoria: "Promoções",
    titulo: "Viatura patrocinada",
    descricao: "O seu anúncio BMW está a receber 3x mais visualizações",
    hora: "Ontem",
    lida: true,
  },
  {
    categoria: "Mensagens",
    titulo: "Nova mensagem de EcoCars",
    descricao: "Posso agendar uma visita amanhã?",
    hora: "2 dias",
    lida: true,
  },
];

export default function NotificacoesPage() {
  const [filtro, setFiltro] = useState("Todas");
  const filtradas =
    filtro === "Todas"
      ? notificacoes
      : notificacoes.filter((n) => n.categoria === filtro);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm text-muted">
            {notificacoes.filter((n) => !n.lida).length} não lidas
          </p>
        </div>
        <button className="text-sm text-accent font-medium">
          Marcar todas como lidas
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setFiltro(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${c === filtro ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtradas.map((n, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl p-4 shadow-sm border transition-colors cursor-pointer ${n.lida ? "border-gray-100" : "border-accent/30 bg-accent/5"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  n.categoria === "Negociações"
                    ? "bg-blue-50 text-blue-500"
                    : n.categoria === "Pagamentos"
                      ? "bg-emerald-50 text-emerald-500"
                      : n.categoria === "Mensagens"
                        ? "bg-purple-50 text-purple-500"
                        : n.categoria === "Segurança"
                          ? "bg-red-50 text-red-500"
                          : n.categoria === "Promoções"
                            ? "bg-amber-50 text-amber-500"
                            : "bg-gray-50 text-gray-500"
                }`}
              >
                {n.categoria === "Negociações"
                  ? "🤝"
                  : n.categoria === "Pagamentos"
                    ? "💰"
                    : n.categoria === "Mensagens"
                      ? "💬"
                      : n.categoria === "Segurança"
                        ? "🔒"
                        : n.categoria === "Promoções"
                          ? "⭐"
                          : "ℹ️"}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium ${n.lida ? "" : "font-bold"}`}
                  >
                    {n.titulo}
                  </p>
                  {!n.lida && (
                    <span className="w-2 h-2 bg-accent rounded-full" />
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">{n.descricao}</p>
                <p className="text-[10px] text-muted mt-1">{n.hora}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
