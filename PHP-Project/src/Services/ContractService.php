<?php

declare(strict_types=1);

namespace IntermedCars\Services;

use IntermedCars\Database\Database;

/**
 * ContractService
 *
 * Generates PDF contracts for completed vehicle transactions.
 *
 * Contract contains:
 *   - Vehicle details (marca, modelo, ano, preco, etc.)
 *   - Buyer and seller information
 *   - Transaction details (price, dates, status)
 *   - Platform terms and conditions
 *   - Digital signatures placeholder
 */
class ContractService
{
    /**
     * Generate a contract for a completed transaction.
     *
     * @param int $transactionId
     * @return array{success: bool, contract_path: string, contract_number: string, message: string}
     */
    public function generateContract(int $transactionId): array
    {
        $sql = 'SELECT t.*, v.marca, v.modelo, v.ano, v.preco as vehicle_price, v.combustivel, v.caixa, v.cor, v.km,
                       b.nome as buyer_name, b.email as buyer_email, b.telemovel as buyer_phone, b.bi_passaporte as buyer_bi,
                       s.nome as seller_name, s.email as seller_email, s.telemovel as seller_phone, s.bi_passaporte as seller_bi
                FROM transactions t
                JOIN vehicles v ON t.vehicle_id = v.id
                JOIN users b ON t.buyer_id = b.id
                JOIN users s ON t.seller_id = s.id
                WHERE t.id = :id';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute(['id' => $transactionId]);
        $transaction = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$transaction) {
            return [
                'success' => false,
                'contract_path' => '',
                'contract_number' => '',
                'message' => 'Transacao nao encontrada.',
            ];
        }

        $contractNumber = 'IC-' . date('Ymd') . '-' . str_pad((string) $transactionId, 6, '0', STR_PAD_LEFT);
        $html = $this->buildContractHtml($transaction, $contractNumber);
        $contractPath = $this->saveContract($contractNumber, $html);

        return [
            'success' => true,
            'contract_path' => $contractPath,
            'contract_number' => $contractNumber,
            'message' => 'Contrato gerado com sucesso.',
        ];
    }

    /**
     * Build the HTML content for the contract.
     *
     * @param array<string, mixed> $data
     * @param string $contractNumber
     * @return string
     */
    private function buildContractHtml(array $data, string $contractNumber): string
    {
        $preco = number_format((float) $data['vehicle_price'], 2, ',', '.');
        $comissao = number_format(100000, 2, ',', '.');
        $date = date('d/m/Y');
        $hora = date('H:i');
        $iban = $_ENV['PAYMENT_IBAN'] ?? getenv('PAYMENT_IBAN') ?: 'N/D';
        $beneficiary = $_ENV['PAYMENT_BENEFICIARY'] ?? getenv('PAYMENT_BENEFICIARY') ?: 'N/D';

        return <<<HTML
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Contrato {$contractNumber}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1a1a; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #10b981; }
        .subtitle { color: #666; font-size: 14px; }
        .section { margin: 25px 0; }
        .section-title { font-size: 16px; font-weight: bold; color: #10b981; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .field { display: flex; margin: 8px 0; }
        .label { width: 180px; font-weight: 600; color: #374151; }
        .value { flex: 1; }
        .highlight { background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
        .signature-box { display: flex; justify-content: space-between; margin-top: 60px; }
        .sig-block { width: 45%; text-align: center; }
        .sig-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 10px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #999; font-size: 11px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">IntermedCars</div>
        <div class="subtitle">Marketplace Automotivo Premium</div>
        <h2>CONTRATO DE COMPRA E VENDA DE VEICULO</h2>
        <p><strong>Contrato N.o:</strong> {$contractNumber} | <strong>Data:</strong> {$date} {$hora}</p>
    </div>

    <div class="section">
        <div class="section-title">1. PARTES CONTRATANTES</div>
        <div class="field"><span class="label">Vendedor:</span><span class="value">{$data['seller_name']}</span></div>
        <div class="field"><span class="label">BI/Passaporte:</span><span class="value">{$data['seller_bi']}</span></div>
        <div class="field"><span class="label">Email:</span><span class="value">{$data['seller_email']}</span></div>
        <div class="field"><span class="label">Telemovel:</span><span class="value">{$data['seller_phone']}</span></div>
        <div class="field"><span class="label">Comprador:</span><span class="value">{$data['buyer_name']}</span></div>
        <div class="field"><span class="label">BI/Passaporte:</span><span class="value">{$data['buyer_bi']}</span></div>
        <div class="field"><span class="label">Email:</span><span class="value">{$data['buyer_email']}</span></div>
        <div class="field"><span class="label">Telemovel:</span><span class="value">{$data['buyer_phone']}</span></div>
    </div>

    <div class="section">
        <div class="section-title">2. OBJETO DO CONTRATO</div>
        <div class="field"><span class="label">Marca:</span><span class="value">{$data['marca']}</span></div>
        <div class="field"><span class="label">Modelo:</span><span class="value">{$data['modelo']}</span></div>
        <div class="field"><span class="label">Ano:</span><span class="value">{$data['ano']}</span></div>
        <div class="field"><span class="label">Cor:</span><span class="value">{$data['cor']}</span></div>
        <div class="field"><span class="label">Combustivel:</span><span class="value">{$data['combustivel']}</span></div>
        <div class="field"><span class="label">Caixa:</span><span class="value">{$data['caixa']}</span></div>
        <div class="field"><span class="label">Quilometragem:</span><span class="value">{$data['km']} km</span></div>
    </div>

    <div class="section">
        <div class="section-title">3. CONDICOES FINANCEIRAS</div>
        <div class="highlight">
            <div class="field"><span class="label">Preco de Venda:</span><span class="value" style="font-size:18px;font-weight:bold;color:#10b981">Kz {$preco}</span></div>
            <div class="field"><span class="label">Taxa Fixa Plataforma (Vendedor):</span><span class="value">Kz {$comissao}</span></div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">4. TERMOS E CONDICOES</div>
        <p style="font-size:13px;color:#555">
            4.1. O vendedor declara ser legitimo proprietario do veiculo descrito.<br>
            4.2. O comprador declara ter inspecionado e aceitado o veiculo.<br>
            4.3. A transferencia de propriedade efetua-se apos o pagamento integral.<br>
            4.4. A IntermedCars atua como intermediario e cobra uma taxa fixa de 100.000 Kz, paga apenas pelo vendedor.<br>
            4.5. Prazo de pagamento da taxa: 72 horas apos vistoria.<br>
            4.6. Atraso no pagamento gera multa de 1% adicional + bloqueio temporario.
        </p>
    </div>

    <div class="signature-box">
        <div class="sig-block">
            <div class="sig-line">
                <p><strong>Vendedor</strong></p>
                <p>{$data['seller_name']}</p>
            </div>
        </div>
        <div class="sig-block">
            <div class="sig-line">
                <p><strong>Comprador</strong></p>
                <p>{$data['buyer_name']}</p>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>IntermedCars - Marketplace Automotivo Premium</p>
        <p>Este contrato e gerado automaticamente pela plataforma IntermedCars.</p>
        <p>IBAN para pagamentos: {$iban} | Beneficiario: {$beneficiary}</p>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Save contract HTML to storage.
     *
     * @param string $contractNumber
     * @param string $html
     * @return string File path
     */
    private function saveContract(string $contractNumber, string $html): string
    {
        $storageDir = dirname(__DIR__, 2) . '/storage/contracts';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }

        $filePath = $storageDir . '/' . $contractNumber . '.html';
        file_put_contents($filePath, $html);

        return $filePath;
    }

    /**
     * Get contract by transaction ID.
     *
     * @param int $transactionId
     * @return array{success: bool, contract_number: string, contract_path: string, message: string}
     */
    public function getContract(int $transactionId): array
    {
        $contractNumber = 'IC-' . date('Ymd') . '-' . str_pad((string) $transactionId, 6, '0', STR_PAD_LEFT);
        $filePath = dirname(__DIR__, 2) . '/storage/contracts/' . $contractNumber . '.html';

        if (!file_exists($filePath)) {
            return [
                'success' => false,
                'contract_number' => $contractNumber,
                'contract_path' => '',
                'message' => 'Contrato nao encontrado. Gere o contrato primeiro.',
            ];
        }

        return [
            'success' => true,
            'contract_number' => $contractNumber,
            'contract_path' => $filePath,
            'message' => 'Contrato encontrado.',
        ];
    }
}
