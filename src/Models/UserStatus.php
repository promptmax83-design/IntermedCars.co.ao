<?php

declare(strict_types=1);

namespace IntermedCars\Models;

/**
 * User Status Enum
 *
 * Represents the verification and account status of a user.
 *
 * Status Flow:
 *   pendente_verificacao -> verificado
 *   pendente_verificacao -> verificacao_recusada
 *   verificado -> temporariamente_banido (por incumprimento)
 *   temporariamente_banido -> verificado (apos pagamento da divida)
 */
enum UserStatus: string
{
    case PENDENTE_VERIFICACAO = 'pendente_verificacao';
    case VERIFICADO = 'verificado';
    case VERIFICACAO_RECUSADA = 'verificacao_recusada';
    case TEMPORARIAMENTE_BANIDO = 'temporariamente_banido';

    public function label(): string
    {
        return match ($this) {
            self::PENDENTE_VERIFICACAO => 'Pendente Verificacao',
            self::VERIFICADO => 'Verificado',
            self::VERIFICACAO_RECUSADA => 'Verificacao Recusada',
            self::TEMPORARIAMENTE_BANIDO => 'Temporariamente Banido',
        };
    }

    public function canTransact(): bool
    {
        return $this === self::VERIFICADO;
    }

    public function canSell(): bool
    {
        return $this === self::VERIFICADO;
    }

    public function canBuy(): bool
    {
        return $this === self::VERIFICADO;
    }
}
