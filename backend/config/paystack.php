<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Paystack Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration settings for Paystack payment
    | gateway integration. Ensure you set the correct keys in your .env file.
    |
    */

    'public_key' => env('PAYSTACK_PUBLIC_KEY'),

    'secret_key' => env('PAYSTACK_SECRET_KEY'),

    'payment_url' => env('PAYSTACK_PAYMENT_URL', 'https://api.paystack.co'),

    'merchant_email' => env('PAYSTACK_MERCHANT_EMAIL'),

    /*
    |--------------------------------------------------------------------------
    | Callback URL
    |--------------------------------------------------------------------------
    |
    | The URL Paystack will redirect to after payment processing.
    |
    */

    'callback_url' => env('PAYSTACK_CALLBACK_URL', '/api/payments/callback'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Secret
    |--------------------------------------------------------------------------
    |
    | Used to verify that webhook requests are coming from Paystack.
    |
    */

    'webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | Default currency for transactions.
    |
    */

    'currency' => env('PAYSTACK_CURRENCY', 'NGN'),

    /*
    |--------------------------------------------------------------------------
    | Paystack Channels
    |--------------------------------------------------------------------------
    |
    | Payment channels to enable.
    |
    */

    'channels' => ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],

];
