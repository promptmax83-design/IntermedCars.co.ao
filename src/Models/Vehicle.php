<?php

declare(strict_types=1);

namespace IntermedCars\Models;

/**
 * Vehicle Model
 *
 * Only road vehicles: Carro, Carrinha, Camiao.
 * Motos/quadriciclos and barcos/jet skis are excluded.
 *
 * @property int $id
 * @property string $tipo Vehicle type: carro, carrinha, camiao
 * @property string $marca
 * @property string $modelo
 * @property int $ano
 * @property float $preco
 * @property string $specs
 * @property string $combustivel
 * @property string $caixa
 * @property string $cor
 * @property int $potencia
 * @property string $tracao
 * @property int $km
 * @property string $local
 * @property string $descricao
 * @property int $vendedor_id
 * @property VehicleStatus $status
 * @property bool $vistoria
 * @property string $created_at
 * @property string $updated_at
 */
class Vehicle
{
    public function __construct(
        public readonly int $id,
        public string $tipo,
        public string $marca,
        public string $modelo,
        public int $ano,
        public float $preco,
        public string $specs,
        public string $combustivel,
        public string $caixa,
        public string $cor,
        public int $potencia,
        public string $tracao,
        public int $km,
        public string $local,
        public string $descricao,
        public int $vendedor_id,
        public VehicleStatus $status = VehicleStatus::DISPONIVEL,
        public bool $vistoria = false,
        public string $created_at = '',
        public string $updated_at = '',
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'marca' => $this->marca,
            'modelo' => $this->modelo,
            'ano' => $this->ano,
            'preco' => $this->preco,
            'specs' => $this->specs,
            'combustivel' => $this->combustivel,
            'caixa' => $this->caixa,
            'cor' => $this->cor,
            'potencia' => $this->potencia,
            'tracao' => $this->tracao,
            'km' => $this->km,
            'local' => $this->local,
            'descricao' => $this->descricao,
            'vendedor_id' => $this->vendedor_id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'vistoria' => $this->vistoria,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function isAvailable(): bool
    {
        return $this->status === VehicleStatus::DISPONIVEL;
    }

    public function isNegotiating(): bool
    {
        return $this->status === VehicleStatus::EM_NEGOCIACAO;
    }

    public function isSold(): bool
    {
        return $this->status === VehicleStatus::COMPRADO;
    }

    public function isCancelled(): bool
    {
        return $this->status === VehicleStatus::CANCELADO;
    }
}
