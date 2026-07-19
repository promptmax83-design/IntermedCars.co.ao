"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Logo from "@/components/logo";

const navItems = [
  {
    href: "/feed",
    label: "Feed",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    roles: ["admin", "consultor", "user"],
  },
  {
    href: "/explorar",
    label: "Explorar",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    roles: ["consultor", "user"],
  },
  {
    href: "/encontrar-consultor",
    label: "Encontrar Consultor",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    roles: ["user"],
  },
  {
    href: "/negociacoes",
    label: "Negociacoes",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    roles: ["admin", "consultor", "user"],
  },
  {
    href: "/historico",
    label: "Historico",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    roles: ["user"],
  },
  {
    href: "/carteira",
    label: "Carteira",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z",
    roles: ["user"],
  },
];

const navSecondary = [
  {
    href: "/consultor/dashboard",
    label: "Painel Consultor",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5",
    roles: ["consultor"],
  },
  {
    href: "/admin",
    label: "Painel Admin",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    roles: ["admin"],
  },
  {
    href: "/cofre",
    label: "Cofre",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    roles: ["admin", "consultor"],
  },
  {
    href: "/dashboard-financeiro",
    label: "Transacoes",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    roles: ["admin"],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/feed";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[220px] bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shrink-0 shadow-sm">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-slate-100">
        <Link href="/feed">
          <Logo size="md" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.filter((item) => {
          const userRole = user?.role || "user";
          return item.roles.includes(userRole);
        }).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? "bg-[var(--imc-verde-claro-bg)] text-[var(--imc-verde-terra)]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? "bg-[var(--imc-verde-terra)]/10"
                    : "bg-slate-100 group-hover:bg-slate-200/60"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              {item.label}
            </Link>
          );
        })}

        <div className="border-t border-slate-100 my-3" />

        {navSecondary.filter((item) => {
          const userRole = user?.role || "user";
          return item.roles.includes(userRole);
        }).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? "bg-[var(--imc-verde-claro-bg)] text-[var(--imc-verde-terra)]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? "bg-[var(--imc-verde-terra)]/10"
                    : "bg-slate-100 group-hover:bg-slate-200/60"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Anunciar */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/anunciar"
          className="flex items-center justify-center gap-2 w-full bg-[var(--imc-verde-terra)] hover:bg-[var(--imc-verde-terra)]/90 text-white font-semibold text-[13px] py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Anunciar Veiculo
        </Link>
      </div>
    </aside>
  );
}
