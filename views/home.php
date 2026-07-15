<!DOCTYPE html>
<html lang="pt-AO">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IntermedCars — OS</title>
    <link rel="stylesheet" href="output.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        .card-glow:hover { box-shadow: 0 0 20px rgba(201, 168, 76, 0.08); }
        .sidebar-link:hover { background: rgba(201, 168, 76, 0.06); }
        .sidebar-link.active { background: rgba(201, 168, 76, 0.1); border-right: 2px solid #c9a84c; }
        .pulse-dot { animation: pulse-dot 2s infinite; }
        @keyframes pulse-dot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
        .fade-in { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .shimmer { background: linear-gradient(90deg, #0d0d0d 25%, #1a1a2e 50%, #0d0d0d 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    </style>
</head>
<body class="bg-[#0d0d0d] text-white min-h-screen overflow-hidden">

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- LAYOUT BASE: HEADER + SIDEBAR + CONTENT                   -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div class="flex h-screen">

        <!-- ─── SIDEBAR LATERAL ESQUERDA ─── -->
        <aside class="w-[72px] lg:w-[260px] bg-[#0a0a0a] border-r border-white/5 flex flex-col h-full flex-shrink-0">

            <!-- Logo -->
            <div class="h-16 flex items-center justify-center lg:justify-start lg:px-5 border-b border-white/5">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-[#10b981] flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <span class="hidden lg:block text-sm font-bold tracking-wide text-white">INTERMEDCARS<span class="text-[#10b981]">.</span></span>
                </div>
            </div>

            <!-- Navegação -->
            <nav class="flex-1 py-4 px-2 lg:px-3 space-y-1 overflow-y-auto scrollbar-thin">
                <!-- Dashboard -->
                <a href="/" class="sidebar-link active flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    <span class="hidden lg:block">Dashboard</span>
                </a>

                <!-- Mercado -->
                <a href="/explorar" class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    <span class="hidden lg:block">Mercado</span>
                </a>

                <!-- Os Meus Carros -->
                <a href="/perfil" class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                    <span class="hidden lg:block">Os Meus Carros</span>
                    <span class="hidden lg:inline-flex ml-auto bg-[#c9a84c]/10 text-[#c9a84c] text-[10px] font-bold px-1.5 py-0.5 rounded">3</span>
                </a>

                <!-- Lances / Propostas -->
                <a href="/chat" class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span class="hidden lg:block">Lances / Propostas</span>
                    <span class="hidden lg:inline-flex ml-auto bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold px-1.5 py-0.5 rounded">5</span>
                </a>

                <!-- Mensagens -->
                <a href="/chat" class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    <span class="hidden lg:block">Mensagens</span>
                    <span class="hidden lg:inline-flex ml-auto bg-red-500/10 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded">2</span>
                </a>

                <!-- Separador -->
                <div class="border-t border-white/5 my-3"></div>

                <!-- Vistoria -->
                <a href="/vistoria" class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span class="hidden lg:block">Vistoria</span>
                </a>

                <!-- Contrato -->
                <a href="/contrato" class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span class="hidden lg:block">Contrato</span>
                </a>

                <!-- Definições -->
                <a href="/admin" class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all">
                    <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span class="hidden lg:block">Definições</span>
                </a>
            </nav>

            <!-- Botão Anunciar -->
            <div class="p-3 lg:p-4 border-t border-white/5">
                <a href="/explorar" class="flex items-center justify-center lg:justify-start gap-2 w-full bg-[#10b981] hover:bg-[#0ea573] text-white font-semibold text-sm py-2.5 px-3 rounded-lg transition-colors">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <span class="hidden lg:block">Anunciar Veículo</span>
                </a>
            </div>
        </aside>

        <!-- ─── CONTEÚDO PRINCIPAL ─── -->
        <main class="flex-1 flex flex-col h-full overflow-hidden">

            <!-- ═══════════════════════════════════════════════════ -->
            <!-- HEADER SUPERIOR (Barra do OS)                       -->
            <!-- ═══════════════════════════════════════════════════ -->
            <header class="h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">

                <!-- Esquerda: Logo mobile -->
                <div class="flex items-center gap-3 lg:hidden">
                    <div class="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                </div>

                <!-- Centro: Omni-Search -->
                <div class="flex-1 max-w-xl mx-auto hidden sm:block">
                    <div class="relative">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" placeholder="Pesquisar veículos, marcas, modelos..." class="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-20 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-all">
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd class="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-white/5 border border-white/10 rounded">Ctrl</kbd>
                            <kbd class="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-white/5 border border-white/10 rounded">K</kbd>
                        </div>
                    </div>
                </div>

                <!-- Direita: Status, Notificações, Perfil -->
                <div class="flex items-center gap-3">
                    <!-- Status do Sistema -->
                    <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                        <span class="w-2 h-2 rounded-full bg-[#10b981] pulse-dot"></span>
                        <span class="text-[11px] text-gray-400 font-medium">Sistema Ativo</span>
                    </div>

                    <!-- Notificações -->
                    <a href="/notificacoes" class="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c9a84c] rounded-full"></span>
                    </a>

                    <!-- Perfil -->
                    <a href="/perfil" class="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b8933d] flex items-center justify-center text-xs font-bold text-[#0d0d0d]">CF</div>
                        <span class="hidden lg:block text-sm font-medium text-gray-300">Carla</span>
                    </a>
                </div>
            </header>

            <!-- ═══════════════════════════════════════════════════ -->
            <!-- CONTEÚDO SCROLLÁVEL                                 -->
            <!-- ═══════════════════════════════════════════════════ -->
            <div class="flex-1 overflow-y-auto scrollbar-thin bg-[#0d0d0d]">

                <!-- ═══════════════════════════════════════════════ -->
                <!-- SECÇÃO 1: HERO OPERACIONAL                       -->
                <!-- ═══════════════════════════════════════════════ -->
                <section class="px-4 lg:px-8 pt-6 pb-4">

                    <!-- Banner de Boas-vindas -->
                    <div class="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] border border-white/5 p-6 lg:p-8 mb-6">
                        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50"></div>
                        <div class="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <p class="text-gray-400 text-sm mb-1">Bem-vinda de volta,</p>
                                <h1 class="text-2xl lg:text-3xl font-bold text-white">Carla Fernanda<span class="text-[#10b981]">.</span></h1>
                                <p class="text-gray-500 text-sm mt-2">IntermedCars OS v2.0 — Plataforma de Mobilidade Inteligente</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10b981]/10 text-[#10b981] text-xs font-semibold">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] pulse-dot"></span>
                                    Online
                                </span>
                                <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] text-xs font-semibold">Pro</span>
                            </div>
                        </div>
                    </div>

                    <!-- Widgets de Métricas -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">

                        <!-- Total Viaturas -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl p-4 card-glow transition-all hover:border-white/10">
                            <div class="flex items-center justify-between mb-3">
                                <div class="w-9 h-9 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                                </div>
                                <span class="text-[10px] text-[#10b981] font-semibold bg-[#10b981]/10 px-1.5 py-0.5 rounded">+12%</span>
                            </div>
                            <p class="text-2xl font-bold text-white">127</p>
                            <p class="text-[11px] text-gray-500 mt-1">Total Viaturas</p>
                        </div>

                        <!-- Lances Ativos -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl p-4 card-glow transition-all hover:border-white/10">
                            <div class="flex items-center justify-between mb-3">
                                <div class="w-9 h-9 rounded-lg bg-[#c9a84c]/10 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                </div>
                                <span class="text-[10px] text-[#c9a84c] font-semibold bg-[#c9a84c]/10 px-1.5 py-0.5 rounded">+5 hoje</span>
                            </div>
                            <p class="text-2xl font-bold text-white">34</p>
                            <p class="text-[11px] text-gray-500 mt-1">Lances Ativos</p>
                        </div>

                        <!-- Negócios Fechados -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl p-4 card-glow transition-all hover:border-white/10">
                            <div class="flex items-center justify-between mb-3">
                                <div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                </div>
                                <span class="text-[10px] text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">esta semana</span>
                            </div>
                            <p class="text-2xl font-bold text-white">8</p>
                            <p class="text-[11px] text-gray-500 mt-1">Negócios Fechados</p>
                        </div>

                        <!-- Receita -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl p-4 card-glow transition-all hover:border-white/10">
                            <div class="flex items-center justify-between mb-3">
                                <div class="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                                </div>
                                <span class="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded">+18%</span>
                            </div>
                            <p class="text-2xl font-bold text-white">4.2M</p>
                            <p class="text-[11px] text-gray-500 mt-1">Receita (Kz)</p>
                        </div>
                    </div>
                </section>

                <!-- ═══════════════════════════════════════════════ -->
                <!-- SECÇÃO 2: GRID DE VEÍCULOS                       -->
                <!-- ═══════════════════════════════════════════════ -->
                <section class="px-4 lg:px-8 py-4">

                    <!-- Cabeçalho + Filtros -->
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
                        <div>
                            <h2 class="text-lg font-bold text-white">Mercado</h2>
                            <p class="text-xs text-gray-500">Veículos disponíveis para compra e lance</p>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <button class="px-3 py-1.5 rounded-lg bg-[#c9a84c] text-[#0d0d0d] text-xs font-semibold transition-colors">Todos</button>
                            <button class="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors">Destaques</button>
                            <button class="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors">Mais Recentes</button>
                            <button class="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors">A Acabar</button>
                            <button class="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors">Leilão</button>
                        </div>
                    </div>

                    <!-- Grid de Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        <!-- Card 1: BMW M3 Competition -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl overflow-hidden card-glow transition-all hover:border-[#c9a84c]/30 group cursor-pointer">
                            <div class="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <svg class="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                                </div>
                                <!-- Badges -->
                                <div class="absolute top-3 left-3 flex items-center gap-1.5">
                                    <span class="px-2 py-0.5 rounded-md bg-[#10b981] text-white text-[10px] font-bold uppercase">Destaque</span>
                                </div>
                                <div class="absolute top-3 right-3">
                                    <span class="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">2023</span>
                                </div>
                                <!-- Tempo Restante -->
                                <div class="absolute bottom-3 right-3">
                                    <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#c9a84c]/90 text-[#0d0d0d] text-[10px] font-bold">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        2d 14h
                                    </span>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="text-sm font-bold text-white group-hover:text-[#c9a84c] transition-colors">BMW M3 Competition</h3>
                                <p class="text-[11px] text-gray-500 mt-0.5">Automação • 3.0L • 510cv</p>
                                <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <div>
                                        <p class="text-[10px] text-gray-500">Lance Atual</p>
                                        <p class="text-sm font-bold text-[#10b981]">Kz 18.500.000</p>
                                    </div>
                                    <span class="flex items-center gap-1 text-[10px] text-[#10b981] font-medium">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] pulse-dot"></span>
                                        Ativo
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Card 2: Mercedes-AMG GT -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl overflow-hidden card-glow transition-all hover:border-[#c9a84c]/30 group cursor-pointer">
                            <div class="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <svg class="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                                </div>
                                <div class="absolute top-3 left-3 flex items-center gap-1.5">
                                    <span class="px-2 py-0.5 rounded-md bg-[#c9a84c] text-[#0d0d0d] text-[10px] font-bold uppercase">Leilão</span>
                                </div>
                                <div class="absolute top-3 right-3">
                                    <span class="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">2024</span>
                                </div>
                                <div class="absolute bottom-3 right-3">
                                    <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/90 text-white text-[10px] font-bold">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        4h 22m
                                    </span>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="text-sm font-bold text-white group-hover:text-[#c9a84c] transition-colors">Mercedes-AMG GT 63</h3>
                                <p class="text-[11px] text-gray-500 mt-0.5">Automação • 4.0L V8 • 630cv</p>
                                <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <div>
                                        <p class="text-[10px] text-gray-500">Lance Atual</p>
                                        <p class="text-sm font-bold text-[#10b981]">Kz 42.000.000</p>
                                    </div>
                                    <span class="flex items-center gap-1 text-[10px] text-red-400 font-medium">
                                        <span class="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot"></span>
                                        A Acabar
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Card 3: Porsche 911 Turbo S -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl overflow-hidden card-glow transition-all hover:border-[#c9a84c]/30 group cursor-pointer">
                            <div class="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <svg class="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                                </div>
                                <div class="absolute top-3 left-3 flex items-center gap-1.5">
                                    <span class="px-2 py-0.5 rounded-md bg-blue-500 text-white text-[10px] font-bold uppercase">Novo</span>
                                </div>
                                <div class="absolute top-3 right-3">
                                    <span class="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">2024</span>
                                </div>
                                <div class="absolute bottom-3 right-3">
                                    <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#10b981]/90 text-white text-[10px] font-bold">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                        Compra Direta
                                    </span>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="text-sm font-bold text-white group-hover:text-[#c9a84c] transition-colors">Porsche 911 Turbo S</h3>
                                <p class="text-[11px] text-gray-500 mt-0.5">Automação • 3.8L Flat-6 • 650cv</p>
                                <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <div>
                                        <p class="text-[10px] text-gray-500">Preço</p>
                                        <p class="text-sm font-bold text-white">Kz 65.000.000</p>
                                    </div>
                                    <span class="flex items-center gap-1 text-[10px] text-blue-400 font-medium">
                                        <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        Disponível
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Card 4: Ford Mustang GT -->
                        <div class="bg-[#111111] border border-white/5 rounded-xl overflow-hidden card-glow transition-all hover:border-[#c9a84c]/30 group cursor-pointer">
                            <div class="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <svg class="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                                </div>
                                <div class="absolute top-3 left-3 flex items-center gap-1.5">
                                    <span class="px-2 py-0.5 rounded-md bg-[#c9a84c] text-[#0d0d0d] text-[10px] font-bold uppercase">Leilão</span>
                                </div>
                                <div class="absolute top-3 right-3">
                                    <span class="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">2022</span>
                                </div>
                                <div class="absolute bottom-3 right-3">
                                    <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#c9a84c]/90 text-[#0d0d0d] text-[10px] font-bold">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        1d 8h
                                    </span>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="text-sm font-bold text-white group-hover:text-[#c9a84c] transition-colors">Ford Mustang GT</h3>
                                <p class="text-[11px] text-gray-500 mt-0.5">Manual • 5.0L V8 • 460cv</p>
                                <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <div>
                                        <p class="text-[10px] text-gray-500">Lance Atual</p>
                                        <p class="text-sm font-bold text-[#10b981]">Kz 12.800.000</p>
                                    </div>
                                    <span class="flex items-center gap-1 text-[10px] text-[#10b981] font-medium">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] pulse-dot"></span>
                                        12 lances
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Ver Mais -->
                    <div class="flex justify-center mt-6">
                        <a href="/explorar" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:border-[#c9a84c]/30 transition-all font-medium">
                            Ver Todos os Veículos
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                        </a>
                    </div>
                </section>

                <!-- ═══════════════════════════════════════════════ -->
                <!-- SECÇÃO 3: FEED DE ATIVIDADE + TENDÊNCIAS         -->
                <!-- ═══════════════════════════════════════════════ -->
                <section class="px-4 lg:px-8 py-6 border-t border-white/5">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <!-- Feed de Atividade -->
                        <div class="lg:col-span-2">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-sm font-bold text-white">Atividade Recente</h3>
                                <span class="text-[10px] text-gray-500">Tempo Real</span>
                            </div>
                            <div class="space-y-3">

                                <!-- Atividade 1 -->
                                <div class="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 fade-in">
                                    <div class="w-8 h-8 rounded-full bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-4 h-4 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs text-gray-300"><span class="font-semibold text-white">João Silva</span> fez um lance no <span class="font-semibold text-[#c9a84c]">BMW M3 Competition</span></p>
                                        <p class="text-[10px] text-gray-500 mt-0.5">Há 3 minutos • Kz 18.500.000</p>
                                    </div>
                                </div>

                                <!-- Atividade 2 -->
                                <div class="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 fade-in">
                                    <div class="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs text-gray-300"><span class="font-semibold text-white">Maria Santos</span> adicionou o <span class="font-semibold text-[#10b981]">Ford Mustang GT</span> ao mercado</p>
                                        <p class="text-[10px] text-gray-500 mt-0.5">Há 12 minutos • Novo anúncio</p>
                                    </div>
                                </div>

                                <!-- Atividade 3 -->
                                <div class="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 fade-in">
                                    <div class="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs text-gray-300"><span class="font-semibold text-white">Pedro Costa</span> fechou negócio no <span class="font-semibold text-purple-400">Audi RS6</span></p>
                                        <p class="text-[10px] text-gray-500 mt-0.5">Há 28 minutos • Kz 24.000.000 • Vistoria aprovada</p>
                                    </div>
                                </div>

                                <!-- Atividade 4 -->
                                <div class="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 fade-in">
                                    <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs text-gray-300"><span class="font-semibold text-white">Ana Oliveira</span> enviou proposta para <span class="font-semibold text-blue-400">Mercedes-AMG GT</span></p>
                                        <p class="text-[10px] text-gray-500 mt-0.5">Há 45 minutos • Proposta privada</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- Tendências de Mercado -->
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-sm font-bold text-white">Tendências</h3>
                                <span class="text-[10px] text-gray-500">Esta Semana</span>
                            </div>
                            <div class="space-y-3">

                                <!-- Trending 1 -->
                                <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] font-bold text-[#c9a84c]">01</span>
                                            <span class="text-xs font-medium text-white">BMW M Series</span>
                                        </div>
                                        <span class="text-[10px] text-[#10b981] font-semibold">+24%</span>
                                    </div>
                                    <div class="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div class="h-full bg-[#c9a84c] rounded-full" style="width: 85%"></div>
                                    </div>
                                </div>

                                <!-- Trending 2 -->
                                <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] font-bold text-[#c9a84c]">02</span>
                                            <span class="text-xs font-medium text-white">Mercedes-AMG</span>
                                        </div>
                                        <span class="text-[10px] text-[#10b981] font-semibold">+18%</span>
                                    </div>
                                    <div class="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div class="h-full bg-[#c9a84c] rounded-full" style="width: 72%"></div>
                                    </div>
                                </div>

                                <!-- Trending 3 -->
                                <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] font-bold text-[#c9a84c]">03</span>
                                            <span class="text-xs font-medium text-white">Porsche 911</span>
                                        </div>
                                        <span class="text-[10px] text-[#10b981] font-semibold">+12%</span>
                                    </div>
                                    <div class="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div class="h-full bg-[#c9a84c] rounded-full" style="width: 58%"></div>
                                    </div>
                                </div>

                                <!-- Trending 4 -->
                                <div class="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] font-bold text-[#c9a84c]">04</span>
                                            <span class="text-xs font-medium text-white">Ford Mustang</span>
                                        </div>
                                        <span class="text-[10px] text-[#10b981] font-semibold">+9%</span>
                                    </div>
                                    <div class="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div class="h-full bg-[#c9a84c] rounded-full" style="width: 41%"></div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </section>

                <!-- ═══════════════════════════════════════════════ -->
                <!-- SECÇÃO 4: FOOTER TÉCNICO                         -->
                <!-- ═══════════════════════════════════════════════ -->
                <footer class="px-4 lg:px-8 py-6 border-t border-white/5 bg-[#080808]">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded bg-[#10b981] flex items-center justify-center">
                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                </div>
                                <span class="text-xs font-bold text-gray-400">INTERMEDCARS<span class="text-[#10b981]">.</span></span>
                            </div>
                            <span class="text-[10px] text-gray-600">© 2026 IntermedCars. Todos os direitos reservados.</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <a href="#" class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">Termos</a>
                            <a href="#" class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">Privacidade</a>
                            <a href="#" class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">API</a>
                            <a href="#" class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">Segurança</a>
                            <a href="/sobre" class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">Sobre</a>
                        </div>
                    </div>
                </footer>

            </div>
        </main>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- MOBILE BOTTOM NAV                                          -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <nav class="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-around lg:hidden z-50">
        <a href="/" class="flex flex-col items-center gap-0.5 text-[#c9a84c]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="text-[9px] font-semibold">Início</span>
        </a>
        <a href="/explorar" class="flex flex-col items-center gap-0.5 text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span class="text-[9px]">Mercado</span>
        </a>
        <a href="/explorar" class="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-[#10b981] text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </a>
        <a href="/chat" class="flex flex-col items-center gap-0.5 text-gray-500 relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span class="text-[9px]">Chat</span>
            <span class="absolute -top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </a>
        <a href="/perfil" class="flex flex-col items-center gap-0.5 text-gray-500">
            <div class="w-5 h-5 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b8933d] flex items-center justify-center text-[8px] font-bold text-[#0d0d0d]">CF</div>
            <span class="text-[9px]">Perfil</span>
        </a>
    </nav>

</body>
</html>
