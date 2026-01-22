<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Payments table tracks all payment transactions.
     * Supports Paystack integration with reference tracking.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('payment_reference')->unique();
            $table->string('gateway')->default('paystack'); // paystack, bank_transfer, etc.
            $table->string('gateway_reference')->nullable(); // Paystack transaction reference
            $table->string('authorization_code')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('status', [
                'pending',
                'processing',
                'success',
                'failed',
                'cancelled',
                'refunded',
                'partially_refunded'
            ])->default('pending');
            $table->string('payment_method')->nullable(); // card, bank, ussd, etc.
            $table->string('card_type')->nullable();
            $table->string('card_last_four')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_name')->nullable();
            $table->text('gateway_response')->nullable();
            $table->json('metadata')->nullable();
            $table->decimal('refunded_amount', 12, 2)->default(0);
            $table->text('refund_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('order_id');
            $table->index('user_id');
            $table->index('payment_reference');
            $table->index('gateway_reference');
            $table->index('status');
            $table->index('created_at');
        });

        // Track refunds separately for partial refunds
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('refund_reference')->unique();
            $table->string('gateway_refund_reference')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('status', ['pending', 'processing', 'success', 'failed'])->default('pending');
            $table->text('reason')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('payment_id');
            $table->index('order_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payments');
    }
};
