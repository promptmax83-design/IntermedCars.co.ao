'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: string;
  created_at: string;
}

interface Conversation {
  id: number;
  nome: string;
  last_message: string;
  last_message_at: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const otherUserId = params.userId ? Number(params.userId) : null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user from token
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    // Decode JWT payload to get user id
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.sub);
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async () => {
    if (!otherUserId) return;
    try {
      setLoading(true);
      const data = await api.getMessages(otherUserId);
      setMessages(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  useEffect(() => {
    loadMessages();
    if (otherUserId) loadConversations();
  }, [otherUserId, loadMessages, loadConversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!otherUserId) return;
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [otherUserId, loadMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !otherUserId) return;
    setSending(true);
    try {
      await api.sendMessage(otherUserId, newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <span>←</span>
            <span>Voltar</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Conversations sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 hidden md:block">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Conversas</h2>
          </div>
          <div className="overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Nenhuma conversa</p>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                    otherUserId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">{conv.nome?.charAt(0) || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{conv.nome}</p>
                      <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {otherUserId ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl ${
                          msg.sender_id === currentUserId
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === currentUserId ? 'text-blue-200' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreva uma mensagem..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {sending ? '...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p>Selecione uma conversa para comecar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
