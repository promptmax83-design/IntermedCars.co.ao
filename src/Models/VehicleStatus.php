<?php

declare(strict_types=1);

namespace IntermedCars\Models;

/**
 * Vehicle Status Enum
 *
 * disponivel - Veiculo ativo no mercado, pronto para receber propostas
 * em_negociacao - Comprador avancou com sinal/interesse firme, anuncio pausado
 * comprado - Transacao concluida, comissao paga e contrato gerado
 * cancelado - Anuncio removido pelo vendedor
 */
enum VehicleStatus: string
{
    case DISPONIVEL = 'disponivel';
    case EM_NEGOCIACAO = 'em_negociacao';
    case COMPRADO = 'comprado';
    case CANCELADO = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::DISPONIVEL => 'Disponivel',
            self::EM_NEGOCIACAO => 'Em Negociacao',
            self::COMPRADO => 'Vendido',
            self::CANCELADO => 'Cancelado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DISPONIVEL => 'emerald',
            self::EM_NEGOCIACAO => 'amber',
            self::COMPRADO => 'gray',
            self::CANCELADO => 'red',
        };
    }

    public function canReceiveProposals(): bool
    {
        return $this === self::DISPONIVEL;
    }

    public function canBePurchased(): bool
    {
        return $this === self::DISPONIVEL || $this === self::EM_NEGOCIACAO;
    }

    public function isVisibleOnFeed(): bool
    {
        return $this === self::DISPONIVEL || $this === self::EM_NEGOCIACAO;
    }
}
