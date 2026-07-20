"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { apiPost, apiGet } from "@/lib/api";

interface ConsultantData {
  id: number;
  nome: string;
  ranking: string;
  rating: number;
  distancia_km?: number;
  estado: string;
  latitude: number;
  longitude: number;
}

interface RadarState {
  state: "idle" | "searching" | "found" | "timeout" | "error";
  consultant: ConsultantData | null;
  sessionId: number | null;
  error: string | null;
}

export function useRadar(options: {
  vehicleId: number;
  timeoutMs?: number;
  pollIntervalMs?: number;
}): RadarState & { start: () => void; cancel: () => void } {
  const timeoutMs = options.timeoutMs ?? 60000;
  const pollIntervalMs = options.pollIntervalMs ?? 3000;

  const [state, setState] = useState<RadarState>({
    state: "idle",
    consultant: null,
    sessionId: null,
    error: null,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    cleanup();

    setState({
      state: "searching",
      consultant: null,
      sessionId: null,
      error: null,
    });

    try {
      const res = await apiPost<{ success: boolean; data: { id: number } }>(
        "/api/sessoes",
        { carro_id: options.vehicleId, canal: "chat" }
      );

      const sessionId = res.data.id;
      sessionIdRef.current = sessionId;

      setState((prev) => ({ ...prev, sessionId }));

      const poll = setInterval(async () => {
        try {
          const session = await apiGet<{
            success: boolean;
            data: { status: string; consultor_id: number | null };
          }>(`/api/sessoes/${sessionId}`);

          if (session.data.status === "ativa" && session.data.consultor_id) {
            cleanup();

            try {
              const consultantRes = await apiGet<{
                success: boolean;
                data: ConsultantData;
              }>(`/api/consultants/${session.data.consultor_id}`);

              setState({
                state: "found",
                consultant: consultantRes.data,
                sessionId,
                error: null,
              });
            } catch {
              setState({
                state: "found",
                consultant: null,
                sessionId,
                error: null,
              });
            }
          }
        } catch {
          // Poll error, continue trying
        }
      }, pollIntervalMs);

      pollRef.current = poll;

      timeoutRef.current = setTimeout(() => {
        cleanup();
        setState((prev) => ({
          ...prev,
          state: "timeout",
          error: "Nenhum consultor encontrado no momento",
        }));
      }, timeoutMs);
    } catch (err) {
      cleanup();
      const msg =
        err instanceof Error ? err.message : "Erro ao iniciar busca radar";
      setState({
        state: "error",
        consultant: null,
        sessionId: null,
        error: msg,
      });
    }
  }, [cleanup, options.vehicleId, pollIntervalMs, timeoutMs]);

  const cancel = useCallback(async () => {
    cleanup();

    if (sessionIdRef.current !== null) {
      try {
        await apiPost(`/api/sessoes/${sessionIdRef.current}/encerrar`);
      } catch {
        // Best effort
      }
      sessionIdRef.current = null;
    }

    setState({
      state: "idle",
      consultant: null,
      sessionId: null,
      error: null,
    });
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { ...state, start, cancel };
}
