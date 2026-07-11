import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto - IntermedCars",
  description:
    "Entre em contacto com a IntermedCars. Estamos prontos para ajudá-lo.",
};

export default function Contato() {
  return (
    <div>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-2">
            Fale Connosco
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">Contacto</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Envie-nos uma Mensagem
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
                      placeholder="O seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
                      placeholder="o seu@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
                      placeholder="+351 912 345 678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition bg-white">
                      <option>Avaliação de Viatura</option>
                      <option>Compra</option>
                      <option>Venda</option>
                      <option>Mediação</option>
                      <option>Outro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition resize-none"
                    placeholder="Descreva o que procura ou a viatura que pretende vender..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-primary py-3 rounded-lg hover:bg-accent-hover transition-colors font-semibold text-lg"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Informações</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">📍</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Showroom</h3>
                      <p className="text-muted text-sm">
                        Av. da Liberdade, 1100
                        <br />
                        1250-146 Lisboa
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">📞</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Telefone</h3>
                      <p className="text-muted text-sm">+351 210 123 456</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">✉️</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Email</h3>
                      <p className="text-muted text-sm">
                        geral@intermedcars.pt
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">🕐</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Horário</h3>
                      <p className="text-muted text-sm">
                        Seg - Sex: 9:00 - 19:00
                        <br />
                        Sáb: 10:00 - 14:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-light rounded-xl p-6">
                <h3 className="font-bold mb-3">Avaliação Express</h3>
                <p className="text-muted text-sm mb-4">
                  Precisa de uma avaliação rápida? Ligue-nos ou envie uma foto
                  da sua viatura por WhatsApp.
                </p>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                  <p className="text-sm text-muted">WhatsApp</p>
                  <p className="text-accent font-bold text-lg">
                    +351 912 345 678
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
