"use client";
import { useState } from "react";

const conversas = [
  {
    id: 1,
    nome: "Ana Rodrigues",
    veiculo: "BMW Serie 5",
    ultimoMsg: "Enviei a proposta de 41.500€",
    hora: "14:32",
    naoLida: true,
    estado: "Em negociação",
    cor: "text-amber-500",
  },
  {
    id: 2,
    nome: "Stand AutoPremium",
    veiculo: "Mercedes Classe C",
    ultimoMsg: "Documentos verificados com sucesso",
    hora: "12:15",
    naoLida: true,
    estado: "Documentação",
    cor: "text-blue-500",
  },
  {
    id: 3,
    nome: "Carlos Mendes",
    veiculo: "Porsche Macan S",
    ultimoMsg: "Proposta aceite! A aguardar cofre.",
    hora: "Ontem",
    naoLida: false,
    estado: "Cofre ativo",
    cor: "text-emerald-500",
  },
  {
    id: 4,
    nome: "EcoCars",
    veiculo: "Tesla Model 3",
    ultimoMsg: "Posso agendar uma visita amanhã?",
    hora: "Ontem",
    naoLida: false,
    estado: "Pendente",
    cor: "text-gray-400",
  },
  {
    id: 5,
    nome: "Miguel Costa",
    veiculo: "Audi Q5",
    ultimoMsg: "Contrato assinado, obrigado!",
    hora: "08/07",
    naoLida: false,
    estado: "Concluído",
    cor: "text-green-500",
  },
  {
    id: 6,
    nome: "NordAuto",
    veiculo: "Volvo XC60",
    ultimoMsg: "Fotos recebidas, obrigado.",
    hora: "06/07",
    naoLida: false,
    estado: "Em negociação",
    cor: "text-amber-500",
  },
];

const mensagens = [
  {
    de: "outro",
    texto: "Bom dia! Vi o anúncio do BMW Serie 5. Ainda está disponível?",
    hora: "10:15",
  },
  {
    de: "eu",
    texto: "Bom dia, Ana! Sim, ainda está disponível.",
    hora: "10:18",
  },
  {
    de: "outro",
    texto: "Excelente. Pode-me enviar mais fotos do interior?",
    hora: "10:20",
  },
  { de: "eu", texto: "Claro! Aqui estão.", hora: "10:25", imagem: true },
  { de: "outro", texto: "Perfeito. Qual é o preço final?", hora: "10:30" },
  {
    de: "eu",
    texto: "O preço indicado é 42.900€. Estamos abertos a negociação.",
    hora: "10:32",
  },
  {
    de: "outro",
    texto: "Enviei a proposta de 41.500€. O que acha?",
    hora: "14:30",
  },
  {
    de: "outro",
    texto: "Enviei a proposta de 41.500€",
    hora: "14:32",
    proposta: { valor: "41.500€", estado: "Pendente" },
  },
];

export default function ChatPage() {
  const [conversaAtiva, setConversaAtiva] = useState<number | null>(1);
  const [novaMsg, setNovaMsg] = useState("");

  return (
    <div className="flex h-full">
      <div
        className={`${conversaAtiva ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-gray-200 bg-white shrink-0`}
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold">Mensagens</h2>
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full mt-2 px-3 py-2 bg-light rounded-lg text-sm outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversas.map((c) => (
            <button
              key={c.id}
              onClick={() => setConversaAtiva(c.id)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-light transition-colors text-left ${conversaAtiva === c.id ? "bg-light" : ""}`}
            >
              <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-accent text-sm font-bold shrink-0">
                {c.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium truncate ${c.naoLida ? "font-bold" : ""}`}
                  >
                    {c.nome}
                  </p>
                  <span className="text-[10px] text-muted shrink-0">
                    {c.hora}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">{c.veiculo}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p
                    className={`text-xs truncate ${c.naoLida ? "text-foreground font-medium" : "text-muted"}`}
                  >
                    {c.ultimoMsg}
                  </p>
                  {c.naoLida && (
                    <span className="w-2 h-2 bg-accent rounded-full shrink-0 ml-1" />
                  )}
                </div>
                <p className={`text-[10px] mt-0.5 ${c.cor}`}>{c.estado}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className={`${conversaAtiva ? "flex" : "hidden md:flex"} flex-col flex-1`}
      >
        {conversaAtiva ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
              <button
                onClick={() => setConversaAtiva(null)}
                className="md:hidden text-xl"
              >
                ←
              </button>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-accent text-sm font-bold">
                AR
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Ana Rodrigues</p>
                <p className="text-[10px] text-accent">
                  BMW Serie 5 530e · Em negociação
                </p>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-light flex items-center justify-center text-sm">
                  📞
                </button>
                <button className="w-8 h-8 rounded-full bg-light flex items-center justify-center text-sm">
                  📹
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border-b border-amber-100 px-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-700 font-medium">
                  📋 Status: Em negociação
                </span>
                <span className="text-amber-600">
                  Veículo: BMW Serie 5 · Valor: 42.900€
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5]">
              <div className="text-center">
                <span className="text-[10px] text-muted bg-white px-3 py-1 rounded-full shadow-sm">
                  Hoje
                </span>
              </div>
              {mensagens.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.de === "eu" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-2.5 ${m.de === "eu" ? "bg-accent text-primary" : "bg-white shadow-sm"} ${m.proposta ? "border-2 border-accent" : ""}`}
                  >
                    {m.proposta ? (
                      <div className="text-center">
                        <p className="text-[10px] opacity-70 mb-1">
                          Proposta Financeira
                        </p>
                        <p className="text-lg font-bold">{m.proposta.valor}</p>
                        <p className="text-[10px] text-amber-600 mt-1">
                          ⏳ {m.proposta.estado}
                        </p>
                      </div>
                    ) : m.imagem ? (
                      <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        📷 Foto
                      </div>
                    ) : (
                      <p className="text-sm">{m.texto}</p>
                    )}
                    <p
                      className={`text-[10px] mt-1 ${m.de === "eu" ? "text-primary/50" : "text-muted"}`}
                    >
                      {m.hora}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex gap-2 mb-2">
                <button className="text-lg px-2">📎</button>
                <button className="text-lg px-2">📷</button>
                <button className="text-lg px-2">📍</button>
                <button className="text-lg px-2">💰</button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escrever mensagem..."
                  value={novaMsg}
                  onChange={(e) => setNovaMsg(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-light rounded-full text-sm outline-none"
                />
                <button className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold">
                  →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            Selecione uma conversa
          </div>
        )}
      </div>
    </div>
  );
}
