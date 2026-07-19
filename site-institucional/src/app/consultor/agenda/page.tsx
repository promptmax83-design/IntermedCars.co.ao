"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Compromisso = {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  tipo: string;
  status: string;
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function getDiasDoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}

function getDiaInicial(ano: number, mes: number) {
  return new Date(ano, mes, 1).getDay();
}

export default function ConsultorAgendaPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [diaSelecionado, setDiaSelecionado] = useState(
    new Date().getDate()
  );
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, authLoading, router]);

  const fetchCompromissos = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${API_BASE}/api/consultants/me/schedule?year=${ano}&month=${mes + 1}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setCompromissos(data.data || data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch on mount
    if (isLoggedIn) fetchCompromissos();
  }, [isLoggedIn, fetchCompromissos]);

  const voltarMes = () => {
    if (mes === 0) {
      setMes(11);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const avancarMes = () => {
    if (mes === 11) {
      setMes(0);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  };

  const diasNoMes = getDiasDoMes(ano, mes);
  const diaInicial = getDiaInicial(ano, mes);

  const compromissosDoDia = compromissos.filter((c) => {
    const d = new Date(c.data);
    return (
      d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === diaSelecionado
    );
  });

  const hoje = new Date();
  const isHoje =
    diaSelecionado === hoje.getDate() &&
    mes === hoje.getMonth() &&
    ano === hoje.getFullYear();

  if (authLoading || !isLoggedIn) return null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
        <p className="text-sm text-slate-500">
          Gestao de compromissos e vistorias
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={voltarMes}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-slate-800">
            {MESES[mes]} {ano}
          </h2>
          <button
            onClick={avancarMes}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS_SEMANA.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-slate-500 py-2"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: diaInicial }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: diasNoMes }).map((_, i) => {
            const dia = i + 1;
            const selecionado = dia === diaSelecionado;
            const temCompromisso = compromissos.some((c) => {
              const d = new Date(c.data);
              return d.getDate() === dia;
            });

            return (
              <button
                key={dia}
                onClick={() => setDiaSelecionado(dia)}
                className={`relative h-10 rounded-lg text-sm font-medium transition-colors ${
                  selecionado
                    ? "bg-[#10b981] text-white"
                    : isHoje && dia === hoje.getDate()
                      ? "bg-[#10b981]/10 text-[#10b981]"
                      : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                {dia}
                {temCompromisso && !selecionado && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#10b981]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">
            {diaSelecionado} de {MESES[mes]}
          </h3>
          <button className="px-4 py-2 bg-[#10b981] hover:bg-[#0ea573] text-white text-sm font-semibold rounded-xl transition-colors">
            Novo Compromisso
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">A carregar compromissos...</p>
          </div>
        ) : compromissosDoDia.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800">
              Nenhum compromissao para este dia
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Crie um novo compromisso para comecar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {compromissosDoDia.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50"
              >
                <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">
                    {c.titulo}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.hora} · {c.tipo}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#10b981]/10 text-[#10b981]">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
