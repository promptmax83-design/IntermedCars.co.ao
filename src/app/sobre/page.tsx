import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nós - IntermedCars",
  description: "Conheça a história e equipa da IntermedCars, mediação automóvel de confiança.",
};

const timeline = [
  { ano: "2014", titulo: "Fundação", descricao: "A IntermedCars nasce em Lisboa com a missão de profissionalizar a mediação automóvel." },
  { ano: "2017", titulo: "Expansão", descricao: "Abrimos o nosso showroom de 800m2 em Alfragide com mais de 50 viaturas em exposição." },
  { ano: "2020", titulo: "Digitalização", descricao: "Lançámos a plataforma online, permitindo negociações 100% digitais com cofre fiduciário." },
  { ano: "2024", titulo: "Líderes no Mercado", descricao: "Mais de 1.200 viaturas transacionadas e 98% de satisfação dos clientes." },
];

export default function Sobre() {
  return (
    <div>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-2">Quem Somos</p>
          <h1 className="text-4xl md:text-5xl font-bold">Sobre a IntermedCars</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">A Nossa História</h2>
              <p className="text-muted mb-4">
                Fundada em 2014, a IntermedCars nasceu da paixão automóvel e da vontade de criar um
                serviço de mediação transparente, seguro e profissional no mercado português.
              </p>
              <p className="text-muted mb-4">
                Começámos com uma pequena equipa de 3 pessoas e um sonho: mudar a forma como os
                portugueses compram e vendem viaturas. Hoje, somos referência no sector com mais de
                50 profissionais dedicados.
              </p>
              <p className="text-muted mb-6">
                A nossa plataforma de cofre fiduciário revolucionou a forma como as transações são
                feitas, garantindo segurança tanto para compradores como para vendedores.
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-accent">1.200+</p>
                  <p className="text-sm text-muted">Viaturas vendidas</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">98%</p>
                  <p className="text-sm text-muted">Satisfação</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">10+</p>
                  <p className="text-sm text-muted">Anos</p>
                </div>
              </div>
            </div>
            <div className="bg-light rounded-xl p-8">
              <div className="relative border-l-2 border-accent ml-4 space-y-8">
                {timeline.map((item) => (
                  <div key={item.ano} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 bg-accent rounded-full"></div>
                    <p className="text-accent font-bold text-sm">{item.ano}</p>
                    <h3 className="font-bold text-lg">{item.titulo}</h3>
                    <p className="text-muted text-sm">{item.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm text-center mb-2">Missão, Visão, Valores</p>
          <h2 className="text-3xl font-bold text-center mb-12">Os Nossos Pilares</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Missão</h3>
              <p className="text-muted">
                Facilitar a compra e venda de viaturas com transparência, segurança e
                profissionalismo, superando as expectativas dos nossos clientes.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-2xl">🔭</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Visão</h3>
              <p className="text-muted">
                Ser a referência em mediação automóvel em Portugal, reconhecida pela inovação
                e excelência no atendimento ao cliente.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-14 h-14 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-2xl">💎</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Valores</h3>
              <p className="text-muted">
                Transparência, Integridade, Inovação, Compromisso com o Cliente e Paixão
                pelo Automóvel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm text-center mb-2">A Nossa Equipa</p>
          <h2 className="text-3xl font-bold text-center mb-12">Quem Trabalha Connosco</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { nome: "João Ferreira", cargo: "CEO & Fundador" },
              { nome: "Ana Rodrigues", cargo: "Diretora Comercial" },
              { nome: "Miguel Costa", cargo: "Gestor de Negócios" },
              { nome: "Inês Martins", cargo: "Consultora Automóvel" },
            ].map((pessoa) => (
              <div key={pessoa.nome} className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-accent text-2xl font-bold">
                    {pessoa.nome.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{pessoa.nome}</h3>
                <p className="text-muted text-sm">{pessoa.cargo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
