<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    protected Order $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $this->order->load('items');

        return (new MailMessage)
            ->subject('Order Confirmation - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line('Thank you for your order! We\'re excited to let you know that we\'ve received your order.')
            ->line('**Order Number:** ' . $this->order->order_number)
            ->line('**Order Date:** ' . $this->order->created_at->format('F j, Y'))
            ->line('**Total:** ' . config('app.currency_symbol') . number_format($this->order->total, 2))
            ->line('---')
            ->line('**Order Items:**')
            ->line($this->formatOrderItems())
            ->line('---')
            ->line('**Shipping Address:**')
            ->line($this->order->shipping_full_name)
            ->line($this->order->formatted_shipping_address)
            ->action('View Order', config('app.frontend_url') . '/orders/' . $this->order->id)
            ->line('If you have any questions about your order, please contact our support team.')
            ->salutation('Thank you for shopping with NaijaShop!');
    }

    /**
     * Format order items for email.
     */
    protected function formatOrderItems(): string
    {
        $items = [];
        foreach ($this->order->items as $item) {
            $items[] = "• {$item->product_name} x {$item->quantity} - " .
                       config('app.currency_symbol') . number_format($item->total, 2);
        }
        return implode("\n", $items);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total' => $this->order->total,
        ];
    }
}
