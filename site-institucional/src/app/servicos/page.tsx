"use client";
import Link from "next/link";

const servicos = [
  {
    titulo: "Compra de Viaturas",
    descricao:
      "Compramos a sua viatura ao melhor preço do mercado. Avaliação gratuita e pagamento imediato.",
    detalhes: [
      "Avaliação em 30 minutos",
      "Pagamento no ato",
      "Sem compromisso",
    ],
    icono: "💰",
  },
  {
    titulo: "Venda de Viaturas",
    descricao:
      "Colocamos a sua viatura à venda com fotografia profissional e divulgação máxima.",
    detalhes: [
      "Fotografia profissional",
      "Anúncio em portais premium",
      "Acompanhamento total",
    ],
    icono: "🏷",
  },
  {
    titulo: "Mediação & Negociação",
    descricao:
      "Gerimos todo o processo de negociação entre comprador e vendedor com total segurança.",
    detalhes: [
      "Cofre fiduciário",
      "Contrato formal",
      "Verificação de documentos",
    ],
    icono: "🤝",
  },
  {
    titulo: "Avaliação de Viaturas",
    descricao:
      "Avaliação gratuita e sem compromisso da sua viatura pelos nossos especialistas.",
    detalhes: [
      "Inspeção de 120 pontos",
      "Relatório detalhado",
      "Cotação de mercado",
    ],
    icono: "🔍",
  },
  {
    titulo: "Financiamento Automóvel",
    descricao:
      "Facilitamos o acesso a crédito automóvel com as melhores condições do mercado.",
    detalhes: ["Parceria com bancos", "Taxas competitivas", "Aprovação rápida"],
    icono: "🏦",
  },
  {
    titulo: "Assistência Pós-Venda",
    descricao:
      "Suporte completo após a compra. Estamos sempre disponíveis para si.",
    detalhes: [
      "Garantia de 12 meses",
      "Suporte telefónico",
      "Rede de oficinas parceiras",
    ],
    icono: "🛡",
  },
];

export default function Servicos() {
  return (
    <div className="min-h-screen bg-[#060608]">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#10b981] font-semibold tracking-widest uppercase text-sm mb-2">
            O Que Fazemos
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#fafafa]">Os Nossos Serviços</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicos.map((servico) => (
              <div
                key={servico.titulo}
                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 hover:border-zinc-700/80 transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{servico.icono}</div>
                <h3 className="text-xl font-bold text-[#fafafa] mb-3">{servico.titulo}</h3>
                <p className="text-[#a1a1aa] mb-4">{servico.descricao}</p>
                <ul className="space-y-2">
                  {servico.detalhes.map((d) => (
                    <li
                      key={d}
                      className="flex items-center gap-2 text-sm text-[#a1a1aa]"
                    >
                      <span className="text-[#10b981]">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#fafafa] mb-4">
            Processo Simples e Transparente
          </h2>
          <p className="text-[#a1a1aa] mb-12 max-w-2xl mx-auto">
            Em 3 passos simples, a sua viatura está pronta para uma nova vida.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                passo: "01",
                titulo: "Avaliação",
                descricao:
                  "Traga a sua viatura para uma avaliação gratuita e sem compromisso.",
              },
              {
                passo: "02",
                titulo: "Negociação",
                descricao:
                  "Apresentamos a melhor proposta e gerimos toda a negociação com segurança.",
              },
              {
                passo: "03",
                titulo: "Conclusão",
                descricao:
                  "Pagamento imediato e tratamento de toda a documentação.",
              },
            ].map((item) => (
              <div key={item.passo} className="text-center">
                <p className="text-[#10b981] text-5xl font-bold mb-4">
                  {item.passo}
                </p>
                <h3 className="text-xl font-bold text-[#fafafa] mb-2">{item.titulo}</h3>
                <p className="text-[#a1a1aa]">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#fafafa] mb-4">Pronto para Começar?</h2>
          <p className="text-[#a1a1aa] mb-8 max-w-xl mx-auto">
            Solicite uma avaliação gratuita da sua viatura ou fale com um dos
            nossos especialistas.
          </p>
          <Link
            href="/contato"
            className="inline-block bg-[#10b981] text-[#060608] px-8 py-3 rounded-xl hover:bg-[#0ea573] transition-colors font-semibold text-lg"
          >
            Solicitar Avaliação
          </Link>
        </div>
      </section>
    </div>
  );
}
