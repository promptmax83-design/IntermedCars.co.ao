"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: string;
  read_at: string | null;
  created_at: string;
  sender_name: string;
};

type Conversation = {
  other_user_id: number;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function decodeUserId(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.sub === "number" ? payload.sub : null;
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const uid = decodeUserId(token);
    if (uid === null) {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
    setCurrentUserId(uid);
  }, [router]);

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // API not available
    }
  }, []);

  const fetchMessages = useCallback(async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // API not available
    }
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || activeChat === null) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: activeChat,
          content: newMessage,
          type: "text",
        }),
      });
      setNewMessage("");
      fetchMessages(activeChat);
    } catch {
      // Fallback
    }
    setLoading(false);
  };

  // Poll conversations every 5 seconds
  useEffect(() => {
    if (currentUserId === null) return;
    const poll = () => { fetchConversations(); };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, fetchConversations]);

  // Poll messages when chat is active
  useEffect(() => {
    if (activeChat === null) return;
    const poll = () => { fetchMessages(activeChat); };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [activeChat, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
  };

  const formatLastMessage = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Agora";
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString("pt-AO", { day: "2-digit", month: "2-digit" });
  };

  if (currentUserId === null) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-[#71717a] text-sm">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] max-w-6xl mx-auto">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-white/[0.06] flex flex-col">
        <div className="p-4 border-b border-white/[0.06]">
          <h1 className="text-lg font-bold text-[#fafafa]">Mensagens</h1>
          <p className="text-xs text-[#71717a]">
            Chat livre — partilhe contactos diretamente
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-[#52525b] text-sm">
              Nenhuma conversa ainda
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.other_user_id}
                onClick={() => setActiveChat(conv.other_user_id)}
                className={`w-full p-4 flex items-center gap-3 transition-colors ${
                  activeChat === conv.other_user_id
                    ? "bg-[#10b981]/10 border-r-2 border-[#10b981]"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold text-sm">
                  {conv.other_user_name[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#fafafa] truncate">
                      {conv.other_user_name}
                    </span>
                    <span className="text-[10px] text-[#52525b]">
                      {formatLastMessage(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717a] truncate mt-0.5">
                    {conv.last_message || "Iniciar conversa..."}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#10b981] text-[#060608] text-[10px] font-bold flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeChat === null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h2 className="text-[#fafafa] font-bold mb-1">IntermedCars Chat</h2>
            <p className="text-sm text-[#71717a] max-w-xs">
              Selecione uma conversa para comecar. Partilhe contactos, WhatsApp ou qualquer forma diretamente.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold text-xs">
              {conversations.find((c) => c.other_user_id === activeChat)?.other_user_name[0] || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-[#fafafa]">
                {conversations.find((c) => c.other_user_id === activeChat)?.other_user_name || "Utilizador"}
              </p>
              <p className="text-[10px] text-[#10b981]">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-[#52525b] text-sm py-8">
                Nenhuma mensagem ainda. Diga olá!
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "bg-[#10b981] text-[#060608]"
                          : "bg-white/[0.04] text-[#fafafa] border border-white/[0.06]"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isMine ? "text-[#060608]/60" : "text-[#52525b]"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escreva uma mensagem..."
                className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#10b981]/30"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || loading}
                className="px-4 py-3 bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
