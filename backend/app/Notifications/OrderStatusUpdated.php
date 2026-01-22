<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected Order $order;
    protected string $oldStatus;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order, string $oldStatus)
    {
        $this->order = $order;
        $this->oldStatus = $oldStatus;
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
        $statusMessages = [
            'confirmed' => 'Your order has been confirmed and is being prepared for shipment.',
            'processing' => 'Your order is now being processed.',
            'shipped' => 'Great news! Your order has been shipped and is on its way to you.',
            'delivered' => 'Your order has been delivered. We hope you enjoy your purchase!',
            'cancelled' => 'Your order has been cancelled.',
            'refunded' => 'Your order has been refunded.',
        ];

        $message = $statusMessages[$this->order->status] ?? 'Your order status has been updated.';

        $mail = (new MailMessage)
            ->subject('Order Update - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line($message)
            ->line('**Order Number:** ' . $this->order->order_number)
            ->line('**New Status:** ' . ucfirst($this->order->status));

        // Add tracking info if shipped
        if ($this->order->status === 'shipped' && $this->order->tracking_number) {
            $mail->line('**Tracking Number:** ' . $this->order->tracking_number);
        }

        // Add cancellation reason if cancelled
        if ($this->order->status === 'cancelled' && $this->order->cancellation_reason) {
            $mail->line('**Reason:** ' . $this->order->cancellation_reason);
        }

        return $mail
            ->action('View Order', config('app.frontend_url') . '/orders/' . $this->order->id)
            ->line('Thank you for shopping with NaijaShop!')
            ->salutation('Best regards, The NaijaShop Team');
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
            'old_status' => $this->oldStatus,
            'new_status' => $this->order->status,
        ];
    }
}
