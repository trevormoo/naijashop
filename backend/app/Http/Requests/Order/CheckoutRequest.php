<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Billing Information
            'billing_first_name' => ['required', 'string', 'max:255'],
            'billing_last_name' => ['required', 'string', 'max:255'],
            'billing_email' => ['required', 'email', 'max:255'],
            'billing_phone' => ['required', 'string', 'max:20'],
            'billing_address' => ['required', 'string', 'max:500'],
            'billing_city' => ['required', 'string', 'max:100'],
            'billing_state' => ['required', 'string', 'max:100'],
            'billing_country' => ['nullable', 'string', 'max:100'],
            'billing_postal_code' => ['nullable', 'string', 'max:20'],

            // Shipping Information
            'same_as_billing' => ['nullable', 'boolean'],
            'shipping_first_name' => ['required_if:same_as_billing,false', 'nullable', 'string', 'max:255'],
            'shipping_last_name' => ['required_if:same_as_billing,false', 'nullable', 'string', 'max:255'],
            'shipping_phone' => ['required_if:same_as_billing,false', 'nullable', 'string', 'max:20'],
            'shipping_address' => ['required_if:same_as_billing,false', 'nullable', 'string', 'max:500'],
            'shipping_city' => ['required_if:same_as_billing,false', 'nullable', 'string', 'max:100'],
            'shipping_state' => ['required_if:same_as_billing,false', 'nullable', 'string', 'max:100'],
            'shipping_country' => ['nullable', 'string', 'max:100'],
            'shipping_postal_code' => ['nullable', 'string', 'max:20'],

            // Additional
            'shipping_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', 'string', 'in:paystack,bank_transfer'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->same_as_billing) {
            $this->merge([
                'shipping_first_name' => $this->billing_first_name,
                'shipping_last_name' => $this->billing_last_name,
                'shipping_phone' => $this->billing_phone,
                'shipping_address' => $this->billing_address,
                'shipping_city' => $this->billing_city,
                'shipping_state' => $this->billing_state,
                'shipping_country' => $this->billing_country ?? 'Nigeria',
                'shipping_postal_code' => $this->billing_postal_code,
            ]);
        }
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'billing_first_name.required' => 'Please enter your first name.',
            'billing_last_name.required' => 'Please enter your last name.',
            'billing_email.required' => 'Please enter your email address.',
            'billing_email.email' => 'Please enter a valid email address.',
            'billing_phone.required' => 'Please enter your phone number.',
            'billing_address.required' => 'Please enter your address.',
            'billing_city.required' => 'Please enter your city.',
            'billing_state.required' => 'Please select your state.',
            'payment_method.required' => 'Please select a payment method.',
            'payment_method.in' => 'Invalid payment method selected.',
        ];
    }
}
