<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Admin user (idempotent)
        User::updateOrCreate(
            ['email' => 'admin@naijashop.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'role' => 'admin',
                'email_verified_at' => now(),
                // keep password stable; updateOrCreate won't re-hash unless you change this line
                'password' => Hash::make('password'),
            ]
        );

        // 2) Categories (idempotent)
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics'],
            ['name' => 'Fashion', 'slug' => 'fashion'],
            ['name' => 'Groceries', 'slug' => 'groceries'],
            ['name' => 'Home & Kitchen', 'slug' => 'home-kitchen'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug']],
                ['name' => $cat['name']]
            );
        }

        // 3) Products (idempotent)
        // Use a unique key like "slug" or "sku". If your Product model doesn't have slug/sku, use "name".
        $electronics = Category::where('slug', 'electronics')->first();
        $fashion     = Category::where('slug', 'fashion')->first();

        $products = [
            [
                'name' => 'Wireless Headphones',
                'slug' => 'wireless-headphones',
                'price' => 45000,
                'description' => 'Comfortable wireless headphones with deep bass.',
                'category_id' => $electronics?->id,
                'is_featured' => true,
            ],
            [
                'name' => 'Smart Watch',
                'slug' => 'smart-watch',
                'price' => 65000,
                'description' => 'Track your fitness and notifications.',
                'category_id' => $electronics?->id,
                'is_featured' => true,
            ],
            [
                'name' => 'Classic Hoodie',
                'slug' => 'classic-hoodie',
                'price' => 30000,
                'description' => 'Soft, comfy hoodie for everyday wear.',
                'category_id' => $fashion?->id,
                'is_featured' => false,
            ],
        ];

        foreach ($products as $p) {
            // If you don't have "slug" column, swap to: ['name' => $p['name']]
            Product::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'name' => $p['name'],
                    'price' => $p['price'],
                    'description' => $p['description'],
                    'category_id' => $p['category_id'],
                    'is_featured' => $p['is_featured'],
                ]
            );
        }
    }
}