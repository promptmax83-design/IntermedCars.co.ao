"use client";

import { useState, useEffect, useRef, useTransition } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Mensagem {
  id: number;
  carro_id: number;
  sessao_id: number | null;
  remetente_id: number;
  remetente_nome: string;
  remetente_role: string;
  tipo: string;
  conteudo: string | null;
  audio_path: string | null;
  audio_duracao_segundos: number | null;
  is_flagged: number;
  created_at: string;
}

interface Sessao {
  id: number;
  carro_id: number;
  status: string;
  comprador_id: number;
  vendedor_id: number;
  consultor_id: number | null;
  originador_id: number;
  marca: string;
  modelo: string;
  ano: number;
  comprador_nome: string;
  vendedor_nome: string;
  consultor_nome: string | null;
}

interface Props {
  sessaoId: number;
  currentUserId: number;
  currentUserRole: string;
}

export default function SessionChat({ sessaoId, currentUserId, currentUserRole: _currentUserRole }: Props) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = useTransition();

  const fetchSessao = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/sessoes/${sessaoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSessao(data.data);
    } catch (err) {
      console.error("Erro ao buscar sessão:", err);
    }
  };

  const fetchMensagens = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/sessoes/${sessaoId}/mensagens?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMensagens(data.data.mensagens);
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => { fetchSessao(); });
    startTransition(() => { fetchMensagens(); });

    pollRef.current = setInterval(() => { startTransition(() => { fetchMensagens(); }); }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessaoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/sessoes/${sessaoId}/mensagens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conteudo: input.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao enviar");

      setInput("");
      fetchMensagens();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "consultor":
        return <span className="text-[10px] font-bold text-[#c9a84c]">Consultor</span>;
      case "cliente":
        return <span className="text-[10px] font-bold text-[#10b981]">Cliente</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {sessao && (
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {sessao.marca} {sessao.modelo} {sessao.ano}
              </p>
              <p className="text-[11px] text-slate-500">
                {sessao.comprador_nome} · {sessao.vendedor_nome} · {sessao.consultor_nome || "Aguardando consultor..."}
              </p>
            </div>
            <div className="ml-auto">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                sessao.status === 'ativa' ? 'bg-[#10b981]/10 text-[#10b981]' :
                sessao.status === 'pendente' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                'bg-slate-100 text-slate-500'
              }`}>
                {sessao.status}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F9FA]">
        {mensagens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[13px] text-slate-400">Nenhuma mensagem ainda</p>
            <p className="text-[11px] text-slate-300 mt-1">Envie a primeira mensagem para iniciar a conversa</p>
          </div>
        ) : (
          mensagens.map((msg) => {
            const isOwn = msg.remetente_id === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-1 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[11px] font-medium text-slate-600">{msg.remetente_nome}</span>
                  {getRoleBadge(msg.remetente_role)}
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.created_at).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isOwn
                    ? 'bg-[#10b981] text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                  {msg.tipo === 'audio' ? (
                    <div className="flex items-center gap-2">
                      <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">▶</button>
                      <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-white rounded-full" />
                      </div>
                      <span className="text-[10px] opacity-70">{msg.audio_duracao_segundos}s</span>
                    </div>
                  ) : (
                    <p className="text-[13px] leading-relaxed">{msg.conteudo}</p>
                  )}
                </div>
                {msg.is_flagged === 1 && (
                  <span className="text-[10px] text-red-500 mt-0.5">⚠ Sinalizada</span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-[12px] text-red-600">{error}</p>
        </div>
      )}

      {sessao?.status === 'ativa' && (
        <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#10b981]/40 transition-colors"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2.5 bg-[#10b981] hover:bg-[#0ea573] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      )}

      {sessao?.status !== 'ativa' && (
        <div className="p-4 border-t border-slate-200 bg-white text-center">
          <p className="text-[12px] text-slate-400">Sessão encerrada — mensagens são apenas leitura</p>
        </div>
      )}
    </div>
  );
}
