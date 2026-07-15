"use client";

import { useState } from "react";

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "Avaliação de Viatura",
    mensagem: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[IntermedCars] ${formData.assunto}`);
    const body = encodeURIComponent(
      `Nome: ${formData.nome}\nEmail: ${formData.email}\nTelefone: ${formData.telefone}\n\n${formData.mensagem}`
    );
    window.open(`mailto:geral@intermedcars.co.ao?subject=${subject}&body=${body}`, "_self");
    setSubmitted(true);
    setFormData({ nome: "", email: "", telefone: "", assunto: "Avaliação de Viatura", mensagem: "" });
  };

  return (
    <div className="min-h-screen bg-[#060608]">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#10b981] font-semibold tracking-widest uppercase text-sm mb-2">
            Fale Connosco
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#fafafa]">Contacto</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#fafafa] mb-6">
                Envie-nos uma Mensagem
              </h2>
              {submitted && (
                <div className="mb-6 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-[#10b981] text-sm">
                  O seu cliente de email foi aberto com a mensagem pronta. Enviou com sucesso!
                  <button
                    onClick={() => setSubmitted(false)}
                    className="ml-3 underline hover:text-white transition-colors"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#71717a] mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[#fafafa] placeholder-[#52525b] focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition"
                      placeholder="O seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#71717a] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[#fafafa] placeholder-[#52525b] focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition"
                      placeholder="o seu@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#71717a] mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[#fafafa] placeholder-[#52525b] focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition"
                      placeholder="+244 912 345 678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#71717a] mb-2">
                      Assunto
                    </label>
                    <select
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[#fafafa] focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition"
                    >
                      <option value="Avaliação de Viatura">Avaliação de Viatura</option>
                      <option value="Compra">Compra</option>
                      <option value="Venda">Venda</option>
                      <option value="Mediação">Mediação</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#71717a] mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={5}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[#fafafa] placeholder-[#52525b] focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition resize-none"
                    placeholder="Descreva o que procura ou a viatura que pretende vender..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#10b981] text-[#060608] py-3 rounded-xl hover:bg-[#0ea573] transition-colors font-semibold text-lg"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#fafafa] mb-6">Informações</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-[#10b981]">📍</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#fafafa]">Showroom</h3>
                      <p className="text-[#a1a1aa] text-sm">
                        Av. De Portugal, 142
                        <br />
                        Luanda, Angola
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-[#10b981]">📞</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#fafafa]">Telefone</h3>
                      <p className="text-[#a1a1aa] text-sm">+244 222 123 456</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-[#10b981]">✉️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#fafafa]">Email</h3>
                      <p className="text-[#a1a1aa] text-sm">
                        geral@intermedcars.co.ao
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-[#10b981]">🕐</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#fafafa]">Horário</h3>
                      <p className="text-[#a1a1aa] text-sm">
                        Seg - Sex: 8:00 - 18:00
                        <br />
                        Sáb: 8:00 - 13:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/80">
                <h3 className="font-bold text-[#fafafa] mb-3">Avaliação Express</h3>
                <p className="text-[#a1a1aa] text-sm mb-4">
                  Precisa de uma avaliação rápida? Ligue-nos ou envie uma foto
                  da sua viatura por WhatsApp.
                </p>
                <div className="bg-[#060608] rounded-xl p-4 text-center border border-zinc-800/80">
                  <p className="text-sm text-[#71717a]">WhatsApp</p>
                  <p className="text-[#10b981] font-bold text-lg">
                    +244 912 345 678
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
