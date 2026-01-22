<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@naijashop.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create test customer
        User::create([
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'email' => 'customer@naijashop.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'email_verified_at' => now(),
        ]);

        // Create categories
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'is_featured' => true],
            ['name' => 'Fashion', 'slug' => 'fashion', 'is_featured' => true],
            ['name' => 'Home & Living', 'slug' => 'home', 'is_featured' => true],
            ['name' => 'Phones & Tablets', 'slug' => 'phones', 'is_featured' => true],
            ['name' => 'Computing', 'slug' => 'computing', 'is_featured' => true],
            ['name' => 'Health & Beauty', 'slug' => 'health-beauty', 'is_featured' => true],
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        // Create subcategories
        $electronics = Category::where('slug', 'electronics')->first();
        $subCategories = [
            ['name' => 'TVs & Audio', 'slug' => 'tvs-audio', 'parent_id' => $electronics->id],
            ['name' => 'Cameras', 'slug' => 'cameras', 'parent_id' => $electronics->id],
            ['name' => 'Gaming', 'slug' => 'gaming', 'parent_id' => $electronics->id],
        ];

        foreach ($subCategories as $subCategory) {
            Category::create($subCategory);
        }

        // Create sample products
        $sampleProducts = [
            [
                'name' => 'iPhone 15 Pro Max',
                'slug' => 'iphone-15-pro-max',
                'short_description' => 'The latest iPhone with advanced features.',
                'description' => 'Experience the most powerful iPhone ever with A17 Pro chip, 48MP camera system, and all-day battery life.',
                'price' => 1500000,
                'compare_price' => 1650000,
                'category_id' => Category::where('slug', 'phones')->first()->id,
                'stock_quantity' => 50,
                'is_featured' => true,
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'slug' => 'samsung-galaxy-s24-ultra',
                'short_description' => 'Premium Android smartphone with S Pen.',
                'price' => 1200000,
                'category_id' => Category::where('slug', 'phones')->first()->id,
                'stock_quantity' => 35,
                'is_featured' => true,
            ],
            [
                'name' => 'MacBook Pro 16" M3 Max',
                'slug' => 'macbook-pro-16-m3-max',
                'short_description' => 'Professional laptop for creators.',
                'price' => 2500000,
                'category_id' => Category::where('slug', 'computing')->first()->id,
                'stock_quantity' => 20,
                'is_featured' => true,
            ],
            [
                'name' => 'Sony PlayStation 5',
                'slug' => 'sony-playstation-5',
                'short_description' => 'Next-gen gaming console.',
                'price' => 450000,
                'category_id' => Category::where('slug', 'gaming')->first()->id,
                'stock_quantity' => 15,
                'is_featured' => true,
            ],
            [
                'name' => 'LG 65" OLED Smart TV',
                'slug' => 'lg-65-oled-smart-tv',
                'short_description' => 'Stunning 4K OLED display.',
                'price' => 1800000,
                'category_id' => Category::where('slug', 'tvs-audio')->first()->id,
                'stock_quantity' => 10,
                'is_featured' => true,
            ],
            [
                'name' => 'Nike Air Max 270',
                'slug' => 'nike-air-max-270',
                'short_description' => 'Comfortable lifestyle sneakers.',
                'price' => 85000,
                'compare_price' => 95000,
                'category_id' => Category::where('slug', 'fashion')->first()->id,
                'stock_quantity' => 100,
                'is_featured' => true,
            ],
        ];

        foreach ($sampleProducts as $productData) {
            Product::create($productData);
        }

        // Create sample coupons
        Coupon::create([
            'code' => 'WELCOME20',
            'description' => '20% off for new customers',
            'type' => 'percentage',
            'value' => 20,
            'minimum_order_amount' => 10000,
            'maximum_discount_amount' => 50000,
            'usage_limit' => 1000,
            'usage_limit_per_user' => 1,
            'is_active' => true,
            'expires_at' => now()->addMonths(3),
        ]);

        Coupon::create([
            'code' => 'SAVE5000',
            'description' => '₦5,000 off orders above ₦50,000',
            'type' => 'fixed',
            'value' => 5000,
            'minimum_order_amount' => 50000,
            'usage_limit' => 500,
            'is_active' => true,
            'expires_at' => now()->addMonth(),
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin login: admin@naijashop.com / password');
        $this->command->info('Customer login: customer@naijashop.com / password');
    }
}
