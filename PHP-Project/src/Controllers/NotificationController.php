<?php

declare(strict_types=1);

namespace IntermedCars\Controllers;

use IntermedCars\Services\NotificationService;
use IntermedCars\Services\NotificationLogRepository;

class NotificationController extends BaseController
{
    private NotificationService $service;
    private NotificationLogRepository $logRepo;

    public function __construct()
    {
        parent::__construct();
        $this->service = new NotificationService();
        $this->logRepo = new NotificationLogRepository();
    }

    public function testEmail(array $data): void
    {
        try {
            $email = $data['email'] ?? '';
            if (empty($email)) {
                $this->error('Email obrigatorio', 400);
            }
            $result = $this->service->sendEmail(
                $email,
                'IntermedCars — Teste de Email',
                '<h1>Teste OK</h1><p>Se recebeste este email, o Brevo esta funcionar.</p>',
                'test'
            );
            $this->success($result, $result['message'] ?? 'Email enviado');
        } catch (\Throwable $e) {
            error_log("[NotificationController] testEmail error: " . $e->getMessage());
            $this->error('Erro ao enviar email', 500);
        }
    }

    public function testSms(array $data): void
    {
        try {
            $phone = $data['phone'] ?? '';
            if (empty($phone)) {
                $this->error('Telefone obrigatorio', 400);
            }
            $result = $this->service->sendSms($phone, 'IntermedCars: SMS de teste enviado com sucesso!', 'test');
            $this->success($result, $result['message'] ?? 'SMS enviado');
        } catch (\Throwable $e) {
            error_log("[NotificationController] testSms error: " . $e->getMessage());
            $this->error('Erro ao enviar SMS', 500);
        }
    }

    public function testSmsKamba(array $data): void
    {
        try {
            $phone = $data['phone'] ?? '';
            if (empty($phone)) {
                $this->error('Telefone obrigatorio', 400);
            }
            $result = $this->service->sendSms($phone, 'IntermedCars: SMS via KambaSMS de teste!', 'test-kamba');
            $this->success($result, $result['message'] ?? 'SMS Kamba enviado');
        } catch (\Throwable $e) {
            error_log("[NotificationController] testSmsKamba error: " . $e->getMessage());
            $this->error('Erro ao enviar SMS Kamba', 500);
        }
    }

    public function getLogs(): void
    {
        try {
            $target = $_GET['target'] ?? null;
            if ($target) {
                $result = $this->logRepo->findByTarget($target);
            } else {
                $result = $this->logRepo->findRecent();
            }
            $this->success($result);
        } catch (\Throwable $e) {
            error_log("[NotificationController] getLogs error: " . $e->getMessage());
            $this->error('Erro ao buscar logs', 500);
        }
    }
}
