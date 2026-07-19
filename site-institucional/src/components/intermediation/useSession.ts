"use client";

import { useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Session {
  id: number;
  carro_id: number;
  status: string;
  comprador_id: number;
  vendedor_id: number;
  consultor_id: number | null;
  originador_id: number;
  canal: string;
  marca: string;
  modelo: string;
  ano: number;
  comprador_nome: string;
  vendedor_nome: string;
  consultor_nome: string | null;
}

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (statusFilter?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`${API_BASE}/api/sessoes${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      } else {
        setError(data.message || "Erro ao buscar sessões");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (carroId: number, canal: string = "chat") => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/sessoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ carro_id: carroId, canal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao criar sessão");
      return data.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar sessão";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const aceitarSessao = useCallback(async (sessaoId: number) => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/sessoes/${sessaoId}/aceitar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao aceitar sessão");
      return data.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao aceitar sessão";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const encerrarSessao = useCallback(async (sessaoId: number, motivo?: string) => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/sessoes/${sessaoId}/encerrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao encerrar sessão");
      return data.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao encerrar sessão";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    aceitarSessao,
    encerrarSessao,
  };
}
