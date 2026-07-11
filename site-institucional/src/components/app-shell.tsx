"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import SidebarNav from "@/components/sidebar-nav";
import AuthGate from "@/components/auth-gate";
import Logo from "@/components/logo";

const AUTH_PAGES = ["/login", "/registo"];

const mobileNavItems = [
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
  },
  {
    href: "/chat",
    label: "Chat",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    badge: 3,
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();

  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#10b981] border-t-transparent animate-spin" />
          <p className="text-xs text-[#52525b]">A carregar...</p>
        </div>
      </div>
    );
  }

  if (isAuthPage || !isLoggedIn) {
    if (isAuthPage) {
      return <>{children}</>;
    }
    return <AuthGate />;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <SidebarNav />

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0a0a0c] border-b border-white/[0.04] shrink-0">
          <Link href="/">
            <Logo size="sm" showText={false} />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/notificacoes"
              className="relative p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <svg className="w-5 h-5 text-[#71717a]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f59e0b] rounded-full" />
            </Link>
            <Link
              href="/chat"
              className="relative p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <svg className="w-5 h-5 text-[#71717a]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#10b981] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden flex items-center justify-around bg-[#0a0a0c] border-t border-white/[0.04] shrink-0 h-16">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl relative transition-colors ${
                  active ? "text-[#10b981]" : "text-[#52525b]"
                }`}
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-[#10b981] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
