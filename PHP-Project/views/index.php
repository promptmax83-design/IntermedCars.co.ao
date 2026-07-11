<!DOCTYPE html>
<html lang="pt-AO">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IntermedCars - Painel de Controlo</title>
    <link rel="stylesheet" href="output.css">
</head>
<body class="bg-[#f0f2f5] min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-[#0d0d0d] mb-8">
            Painel de Controlo
        </h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Stats Cards -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500 mb-1">Viaturas Ativas</p>
                <p class="text-3xl font-bold text-[#0d0d0d]">127</p>
                <p class="text-xs text-[#10b981] font-semibold mt-2">+12% este mês</p>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500 mb-1">Vendas Concluídas</p>
                <p class="text-3xl font-bold text-[#0d0d0d]">43</p>
                <p class="text-xs text-[#10b981] font-semibold mt-2">+8% este mês</p>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500 mb-1">Negociações Ativas</p>
                <p class="text-3xl font-bold text-[#c9a84c]">18</p>
                <p class="text-xs text-[#f59e0b] font-semibold mt-2">5 urgentes</p>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p class="text-sm text-gray-500 mb-1">Receita Mensal</p>
                <p class="text-3xl font-bold text-[#0d0d0d]">4.2M</p>
                <p class="text-xs text-gray-500 font-semibold mt-2">Kz</p>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-[#0d0d0d] mb-4">Ações Rápidas</h2>
            <div class="flex flex-wrap gap-3">
                <a href="viatura.php" class="bg-[#c9a84c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#b8933d] transition-colors">
                    + Nova Viatura
                </a>
                <a href="vistoria.php" class="bg-[#0d0d0d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                    Iniciar Vistoria
                </a>
                <a href="contrato.php" class="border-2 border-[#0d0d0d] text-[#0d0d0d] px-6 py-3 rounded-lg font-semibold hover:bg-[#0d0d0d] hover:text-white transition-colors">
                    Gerar Contrato
                </a>
            </div>
        </div>
    </div>
</body>
</html>
