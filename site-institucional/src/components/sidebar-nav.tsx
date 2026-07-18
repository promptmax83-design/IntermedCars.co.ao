"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Logo from "@/components/logo";

const navItems = [
  {
    href: "/",
    label: "Feed",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/explorar",
    label: "Explorar",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    href: "/cofre",
    label: "Cofre",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    glow: true,
  },
  {
    href: "/negociacoes",
    label: "Negociacoes",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  },
  {
    href: "/chat",
    label: "Mensagens",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    badge: 3,
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

const navSecondary = [
  {
    href: "/consultor/dashboard",
    label: "Consultor",
    icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z",
    roles: ["admin", "consultor"],
  },
  {
    href: "/admin",
    label: "Admin",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94 1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    roles: ["admin"],
  },
  {
    href: "/dashboard-financeiro",
    label: "Financas",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    roles: ["admin"],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const userInitials = user?.nome
    ? user.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#0a0a0c] border-r border-white/[0.04] shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.04]">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "text-[#71717a] hover:text-[#fafafa] hover:bg-white/[0.03]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? "bg-[#10b981]/15"
                    : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
              </div>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-[#10b981] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {item.glow && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#10b981] animate-glow-emerald" />
              )}
            </Link>
          );
        })}

        <div className="border-t border-white/[0.04] my-3" />

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
                  ? "bg-[#10b981]/10 text-[#10b981]"
                  : "text-[#71717a] hover:text-[#fafafa] hover:bg-white/[0.03]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? "bg-[#10b981]/15"
                    : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/[0.04] space-y-3">
        <Link
          href="/anunciar"
          className="flex items-center justify-center gap-2 w-full bg-[#10b981] hover:bg-[#0ea573] text-[#060608] font-semibold text-[13px] py-2.5 px-4 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Anunciar Veiculo
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer w-full text-left"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b8933d] flex items-center justify-center text-[11px] font-bold text-[#060608]">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate text-[#fafafa]">
              {user?.nome || "Utilizador"}
            </p>
            <p className="text-[11px] text-[#52525b] truncate">
              {user?.verificado ? "Agente Certificado" : "Conta Ativa"}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}
