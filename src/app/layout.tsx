import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import SofiaAI from "./sofia";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IntermedCars - Plataforma de Mediação Automóvel",
  description: "Compra, venda e mediação de viaturas com cofre fiduciário e segurança total.",
};

const navItems = [
  { href: "/", label: "Feed", icon: "🏠" },
  { href: "/explorar", label: "Explorar", icon: "🔍" },
  { href: "/cofre", label: "Cofre", icon: "🔒", highlight: true },
  { href: "/chat", label: "Mensagens", icon: "💬", badge: 3 },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f0f2f5]">
        <div className="flex h-screen overflow-hidden">
          <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0">
            <div className="p-4 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-2">
                <span className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-primary font-bold text-sm">IC</span>
                <span className="font-bold text-lg">IntermedCars</span>
              </Link>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item.highlight ? "bg-accent text-primary" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-4 space-y-1">
                <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
                  <span className="text-lg">⚙️</span> Admin
                </Link>
                <Link href="/mediador" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
                  <span className="text-lg">⚖️</span> Mediador
                </Link>
                <Link href="/dashboard-financeiro" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
                  <span className="text-lg">💰</span> Finanças
                </Link>
              </div>
            </nav>
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-accent font-bold text-sm">JF</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">João Ferreira</p>
                  <p className="text-xs text-muted truncate">Agente Certificado</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <span className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary font-bold text-xs">IC</span>
                <span className="font-bold">IntermedCars</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/notificacoes" className="relative text-xl">🔔<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">5</span></Link>
                <Link href="/chat" className="relative text-xl">💬<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span></Link>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">{children}</main>

            <nav className="lg:hidden flex items-center justify-around bg-white border-t border-gray-200 shrink-0 py-2 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 text-[10px] font-medium px-2 py-1 rounded-lg relative ${
                    item.highlight ? "text-accent" : "text-gray-500"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <SofiaAI />
      </body>
    </html>
  );
}
