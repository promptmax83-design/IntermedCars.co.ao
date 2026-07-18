"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const categorias = [
  "Todas",
  "Negociacoes",
  "Pagamentos",
  "Mensagens",
  "Sistema",
];

type Notificacao = {
  id: number;
  categoria: string;
  titulo: string;
  descricao: string;
  hora: string;
  lida: boolean;
};

type NotificationLog = {
  id: number;
  user_id: number;
  channel: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
};

function mapLogToNotificacao(log: NotificationLog): Notificacao {
  const channelMap: Record<string, string> = {
    email: "Sistema",
    sms: "Pagamentos",
  };

  const titleMap: Record<string, string> = {
    proposta_enviada: "Proposta recebida",
    proposta_aceite: "Proposta aceite",
    deposito_efetuado: "Deposito confirmado",
    comissao_pendente: "Comissao pendente",
    comissao_paga: "Comissao paga",
    transacao_concluida: "Transacao concluida",
  };

  const category = channelMap[log.channel] || "Sistema";
  const title = titleMap[log.subject] || log.subject || "Notificacao";

  const now = new Date();
  const created = new Date(log.created_at);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  let hora = "Agora";
  if (diffD > 0) hora = `${diffD}d`;
  else if (diffH > 0) hora = `${diffH}h`;
  else if (diffMin > 0) hora = `${diffMin}m`;

  return {
    id: log.id,
    categoria: category,
    titulo: title,
    descricao: log.body || "Sem detalhes",
    hora,
    lida: log.status === "sent" || log.status === "delivered",
  };
}

const categoriaIcons: Record<string, string> = {
  Negociacoes: "🤝",
  Pagamentos: "💰",
  Mensagens: "💬",
  Sistema: "ℹ️",
};

const categoriaColors: Record<string, string> = {
  Negociacoes: "bg-[#3b82f6]/10 text-[#3b82f6]",
  Pagamentos: "bg-[#10b981]/10 text-[#10b981]",
  Mensagens: "bg-[#a855f7]/10 text-[#a855f7]",
  Sistema: "bg-[#71717a]/10 text-slate-500",
};

export default function NotificacoesPage() {
  const [filtro, setFiltro] = useState("Todas");
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Sessao expirada");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/notifications/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao carregar notificacoes");

        const result = await res.json();
        const logs: NotificationLog[] = Array.isArray(result) ? result : [];
        setNotificacoes(logs.map(mapLogToNotificacao));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtradas =
    filtro === "Todas"
      ? notificacoes
      : notificacoes.filter((n) => n.categoria === filtro);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarTodasLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notificacoes</h1>
            <p className="text-[13px] text-slate-500">
              {loading
                ? "A carregar..."
                : naoLidas > 0
                  ? `${naoLidas} nao lidas`
                  : "Tudo lido"}
            </p>
          </div>
          {naoLidas > 0 && (
            <button
              onClick={marcarTodasLidas}
              className="text-[13px] text-[#10b981] font-medium hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setFiltro(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                c === filtro
                  ? "bg-[#10b981] text-[#060608]"
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">A carregar notificacoes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-[#ef4444] text-sm">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <div className="space-y-2">
            {filtradas.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm">Sem notificacoes.</p>
              </div>
            ) : (
              filtradas.map((n) => (
                <div
                  key={n.id}
                  className={`bg-slate-50 border rounded-2xl p-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                    n.lida
                      ? "border-slate-200"
                      : "border-[#10b981]/30 bg-[#10b981]/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        categoriaColors[n.categoria] || "bg-[#71717a]/10 text-slate-500"
                      }`}
                    >
                      {categoriaIcons[n.categoria] || "ℹ️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-[13px] ${
                            n.lida ? "text-slate-500" : "font-bold text-slate-800"
                          }`}
                        >
                          {n.titulo}
                        </p>
                        {!n.lida && (
                          <span className="w-2 h-2 bg-[#10b981] rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5">{n.descricao}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.hora}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
