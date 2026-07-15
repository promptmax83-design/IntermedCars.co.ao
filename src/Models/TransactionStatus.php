<?php

declare(strict_types=1);

namespace IntermedCars\Models;

/**
 * Transaction Status Enum
 *
 * Represents the lifecycle of a vehicle transaction from proposal to completion.
 *
 * Status Flow:
 *   proposta_enviada -> proposta_aceite -> deposito_efetuado -> vistoria_concluida
 *     -> comissao_pendente -> comissao_paga -> transacao_concluida
 *   -> proposta_aceite -> deposito_efetuado -> vistoria_concluida
 *     -> comissao_pendente -> prazo_excedido -> multa_aplicada -> divida_pendente -> banido
 */
enum TransactionStatus: string
{
    case PROPOSTA_ENVIADA = 'proposta_enviada';
    case PROPOSTA_ACEITE = 'proposta_aceite';
    case PROPOSTA_RECUSADA = 'proposta_recusada';
    case DEPOSITO_EFETUADO = 'deposito_efetuado';
    case VISTORIA_CONCLUIDA = 'vistoria_concluida';
    case COMISSAO_PENDENTE = 'comissao_pendente';
    case COMISSAO_PAGA = 'comissao_paga';
    case PRAZO_EXCEDIDO = 'prazo_excedido';
    case MULTA_APLICADA = 'multa_aplicada';
    case DIVIDA_PENDENTE = 'divida_pendente';
    case TRANSACAO_CONCLUIDA = 'transacao_concluida';
    case TRANSACAO_CANCELADA = 'transacao_cancelada';

    public function label(): string
    {
        return match ($this) {
            self::PROPOSTA_ENVIADA => 'Proposta Enviada',
            self::PROPOSTA_ACEITE => 'Proposta Aceite',
            self::PROPOSTA_RECUSADA => 'Proposta Recusada',
            self::DEPOSITO_EFETUADO => 'Deposito Efetuado',
            self::VISTORIA_CONCLUIDA => 'Vistoria Concluida',
            self::COMISSAO_PENDENTE => 'Comissao Pendente',
            self::COMISSAO_PAGA => 'Comissao Paga',
            self::PRAZO_EXCEDIDO => 'Prazo Excedido',
            self::MULTA_APLICADA => 'Multa Aplicada',
            self::DIVIDA_PENDENTE => 'Divida Pendente',
            self::TRANSACAO_CONCLUIDA => 'Transacao Concluida',
            self::TRANSACAO_CANCELADA => 'Transacao Cancelada',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PROPOSTA_ENVIADA => 'blue',
            self::PROPOSTA_ACEITE => 'emerald',
            self::PROPOSTA_RECUSADA => 'red',
            self::DEPOSITO_EFETUADO => 'emerald',
            self::VISTORIA_CONCLUIDA => 'emerald',
            self::COMISSAO_PENDENTE => 'amber',
            self::COMISSAO_PAGA => 'emerald',
            self::PRAZO_EXCEDIDO => 'amber',
            self::MULTA_APLICADA => 'red',
            self::DIVIDA_PENDENTE => 'red',
            self::TRANSACAO_CONCLUIDA => 'emerald',
            self::TRANSACAO_CANCELADA => 'gray',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [
            self::TRANSACAO_CONCLUIDA,
            self::TRANSACAO_CANCELADA,
            self::DIVIDA_PENDENTE,
        ], true);
    }
}
