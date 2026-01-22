<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected string $baseUrl;
    protected string $secretKey;

    public function __construct()
    {
        $this->baseUrl = config('paystack.payment_url');
        $this->secretKey = config('paystack.secret_key');
    }

    /**
     * Initialize a transaction.
     */
    public function initializeTransaction(array $data): array
    {
        return $this->makeRequest('POST', '/transaction/initialize', $data);
    }

    /**
     * Verify a transaction.
     */
    public function verifyTransaction(string $reference): array
    {
        return $this->makeRequest('GET', "/transaction/verify/{$reference}");
    }

    /**
     * List transactions.
     */
    public function listTransactions(array $params = []): array
    {
        return $this->makeRequest('GET', '/transaction', $params);
    }

    /**
     * Fetch a transaction.
     */
    public function fetchTransaction(int $id): array
    {
        return $this->makeRequest('GET', "/transaction/{$id}");
    }

    /**
     * Charge an authorization (for recurring payments).
     */
    public function chargeAuthorization(array $data): array
    {
        return $this->makeRequest('POST', '/transaction/charge_authorization', $data);
    }

    /**
     * Create a refund.
     */
    public function createRefund(array $data): array
    {
        return $this->makeRequest('POST', '/refund', $data);
    }

    /**
     * List refunds.
     */
    public function listRefunds(array $params = []): array
    {
        return $this->makeRequest('GET', '/refund', $params);
    }

    /**
     * Fetch a refund.
     */
    public function fetchRefund(string $reference): array
    {
        return $this->makeRequest('GET', "/refund/{$reference}");
    }

    /**
     * List banks.
     */
    public function listBanks(string $country = 'nigeria'): array
    {
        return $this->makeRequest('GET', '/bank', ['country' => $country]);
    }

    /**
     * Resolve account number.
     */
    public function resolveAccount(string $accountNumber, string $bankCode): array
    {
        return $this->makeRequest('GET', '/bank/resolve', [
            'account_number' => $accountNumber,
            'bank_code' => $bankCode,
        ]);
    }

    /**
     * Create a transfer recipient.
     */
    public function createTransferRecipient(array $data): array
    {
        return $this->makeRequest('POST', '/transferrecipient', $data);
    }

    /**
     * Initiate a transfer.
     */
    public function initiateTransfer(array $data): array
    {
        return $this->makeRequest('POST', '/transfer', $data);
    }

    /**
     * Verify transfer.
     */
    public function verifyTransfer(string $reference): array
    {
        return $this->makeRequest('GET', "/transfer/verify/{$reference}");
    }

    /**
     * Make HTTP request to Paystack API.
     */
    protected function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        try {
            $url = $this->baseUrl . $endpoint;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->timeout(30);

            if ($method === 'GET') {
                $response = $response->get($url, $data);
            } else {
                $response = $response->post($url, $data);
            }

            $result = $response->json();

            if (!$response->successful()) {
                Log::error('Paystack API error', [
                    'endpoint' => $endpoint,
                    'status' => $response->status(),
                    'response' => $result,
                ]);
            }

            return $result ?? [
                'status' => false,
                'message' => 'Invalid response from Paystack',
            ];

        } catch (\Exception $e) {
            Log::error('Paystack API exception', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate Paystack transaction fee.
     * Paystack charges: 1.5% + ₦100 (capped at ₦2,000)
     */
    public static function calculateFee(float $amount): float
    {
        $percentageFee = $amount * 0.015;
        $flatFee = 100;
        $totalFee = $percentageFee + $flatFee;

        // Apply cap
        return min($totalFee, 2000);
    }

    /**
     * Calculate amount to charge (including fees).
     */
    public static function calculateChargeAmount(float $amount): float
    {
        return $amount + self::calculateFee($amount);
    }
}
