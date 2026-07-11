"use client";
import { useState } from "react";

export default function SofiaAI() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      de: "sofia",
      texto:
        "Olá! Sou a Sofia, a tua assistente IA da IntermedCars. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");

  const sugestoes = [
    "Encontrar um SUV até 40.000€",
    "Como funciona o cofre fiduciário?",
    "Preciso de financiamento",
    "Agendar uma vistoria",
  ];

  const enviar = (texto?: string) => {
    const msg = texto || input;
    if (!msg.trim()) return;
    setMensagens((prev) => [
      ...prev,
      { de: "eu", texto: msg },
      { de: "sofia", texto: getResposta(msg) },
    ]);
    setInput("");
  };

  const getResposta = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("suv") || lower.includes("40.000"))
      return "Encontrei 8 SUVs até 40.000€. O Volkswagen Tiguan a 36.900€ e o Hyundai Tucson a 35.900€ são ótimas opções. Quer que mostre os detalhes?";
    if (lower.includes("cofre") || lower.includes("fiduciário"))
      return "O cofre fiduciário protege ambas as partes. O comprador deposita o valor, e só é libertado quando toda a documentação está verificada e o contrato assinado. É 100% seguro!";
    if (lower.includes("financiamento"))
      return "Trabalhamos com o CGD (4.2%), BPI (3.9%) e Millennium (4.0%). Posso fazer uma simulação personalizada. Qual é o valor da viatura que pretende?";
    if (lower.includes("vistoria"))
      return "A vistoria é gratuita e dura cerca de 1 hora. Inspecionamos motor, travões, interior, pintura, pneus e suspensão. Posso agendar para amanhã às 10h?";
    return "Entendido! Vou verificar isso para si. Enquanto isso, posso ajudar com mais alguma coisa? Tenho informações sobre viaturas, financiamento, vistorias e o cofre fiduciário.";
  };

  return (
    <>
      {aberto && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[340px] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          <div className="bg-primary text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-sm">
              S
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Sofia IA</p>
              <p className="text-[10px] text-gray-400">
                Assistente IntermedCars · Online
              </p>
            </div>
            <button
              onClick={() => setAberto(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fa]">
            {mensagens.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.de === "eu" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.de === "eu" ? "bg-accent text-primary" : "bg-white shadow-sm border border-gray-100"}`}
                >
                  {m.texto}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {sugestoes.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="text-[10px] bg-light text-muted px-2.5 py-1 rounded-full hover:bg-accent hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Perguntar à Sofia..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                className="flex-1 px-4 py-2.5 bg-light rounded-full text-sm outline-none"
              />
              <button
                onClick={() => enviar()}
                className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-sm"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center text-primary font-bold text-lg z-50 hover:scale-110 transition-transform"
      >
        {aberto ? "✕" : "S"}
      </button>
    </>
  );
}
