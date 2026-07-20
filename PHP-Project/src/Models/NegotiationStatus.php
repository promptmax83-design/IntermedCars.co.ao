<?php

declare(strict_types=1);

namespace IntermedCars\Models;

/**
 * Negotiation Status Enum
 *
 * Lifecycle of a consultant-mediated negotiation.
 *
 * Flow:
 *   aguardando_vistoria -> vistoriado -> aguardando_pagamento_taxas -> taxas_pagas -> concluido
 *   Any state -> cancelado
 */
enum NegotiationStatus: string
{
    case AGUARDANDO_VISTORIA = 'aguardando_vistoria';
    case VISTORIADO = 'vistoriado';
    case AGUARDANDO_PAGAMENTO = 'aguardando_pagamento_taxas';
    case TAXAS_PAGAS = 'taxas_pagas';
    case CONCLUIDO = 'concluido';
    case CANCELADO = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::AGUARDANDO_VISTORIA => 'Aguardando Vistoria',
            self::VISTORIADO => 'Vistoriado',
            self::AGUARDANDO_PAGAMENTO => 'Aguardando Pagamento',
            self::TAXAS_PAGAS => 'Taxas Pagas',
            self::CONCLUIDO => 'Concluido',
            self::CANCELADO => 'Cancelado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::AGUARDANDO_VISTORIA => 'amber',
            self::VISTORIADO => 'blue',
            self::AGUARDANDO_PAGAMENTO => 'amber',
            self::TAXAS_PAGAS => 'emerald',
            self::CONCLUIDO => 'emerald',
            self::CANCELADO => 'gray',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [
            self::CONCLUIDO,
            self::CANCELADO,
        ], true);
    }
}
