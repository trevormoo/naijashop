<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@naijashop.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Create test customer
        User::updateOrCreate(
            ['email' => 'customer@naijashop.com'],
            [
                'first_name' => 'Test',
                'last_name' => 'Customer',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ]
        );

        // Create categories
        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Latest gadgets and electronic devices',
                'is_featured' => true,
            ],
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'description' => 'Trendy clothing and accessories',
                'is_featured' => true,
            ],
            [
                'name' => 'Home & Living',
                'slug' => 'home-living',
                'description' => 'Furniture, decor and home essentials',
                'is_featured' => true,
            ],
            [
                'name' => 'Phones & Tablets',
                'slug' => 'phones-tablets',
                'description' => 'Smartphones and tablets',
                'is_featured' => true,
            ],
            [
                'name' => 'Computing',
                'slug' => 'computing',
                'description' => 'Laptops, desktops and accessories',
                'is_featured' => true,
            ],
            [
                'name' => 'Health & Beauty',
                'slug' => 'health-beauty',
                'description' => 'Personal care and beauty products',
                'is_featured' => true,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        // Get category IDs
        $electronics = Category::where('slug', 'electronics')->first();
        $fashion = Category::where('slug', 'fashion')->first();
        $homeLiving = Category::where('slug', 'home-living')->first();
        $phones = Category::where('slug', 'phones-tablets')->first();
        $computing = Category::where('slug', 'computing')->first();
        $healthBeauty = Category::where('slug', 'health-beauty')->first();

        // Products with real Unsplash images
        $products = [
            // Phones & Tablets
            [
                'name' => 'iPhone 15 Pro Max',
                'slug' => 'iphone-15-pro-max',
                'short_description' => 'The latest iPhone with A17 Pro chip',
                'description' => 'Experience the most powerful iPhone ever with A17 Pro chip, 48MP camera system, titanium design, and all-day battery life. Features ProMotion display and USB-C connectivity.',
                'price' => 1500000,
                'compare_price' => 1650000,
                'category_id' => $phones?->id,
                'stock_quantity' => 50,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'slug' => 'samsung-galaxy-s24-ultra',
                'short_description' => 'Premium Android with S Pen',
                'description' => 'Galaxy AI is here. The Samsung Galaxy S24 Ultra features a titanium frame, 200MP camera, and the embedded S Pen for productivity on the go.',
                'price' => 1200000,
                'compare_price' => 1350000,
                'category_id' => $phones?->id,
                'stock_quantity' => 35,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
            ],
            [
                'name' => 'iPad Pro 12.9" M2',
                'slug' => 'ipad-pro-12-9-m2',
                'short_description' => 'Supercharged by M2 chip',
                'description' => 'The ultimate iPad experience with the M2 chip, stunning Liquid Retina XDR display, and all-day battery life. Perfect for creative professionals.',
                'price' => 950000,
                'category_id' => $phones?->id,
                'stock_quantity' => 25,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
            ],

            // Computing
            [
                'name' => 'MacBook Pro 16" M3 Max',
                'slug' => 'macbook-pro-16-m3-max',
                'short_description' => 'Pro laptop for creators',
                'description' => 'The most powerful MacBook Pro ever. M3 Max chip delivers extraordinary performance for demanding workflows. Up to 22 hours battery life.',
                'price' => 2500000,
                'compare_price' => 2700000,
                'category_id' => $computing?->id,
                'stock_quantity' => 20,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
            ],
            [
                'name' => 'Dell XPS 15 Laptop',
                'slug' => 'dell-xps-15-laptop',
                'short_description' => '15.6" 4K OLED Display',
                'description' => 'Premium Windows laptop with Intel Core i9, 32GB RAM, 1TB SSD. Features stunning 4K OLED display and exceptional build quality.',
                'price' => 1800000,
                'category_id' => $computing?->id,
                'stock_quantity' => 15,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
            ],
            [
                'name' => 'Logitech MX Master 3S Mouse',
                'slug' => 'logitech-mx-master-3s',
                'short_description' => 'Advanced wireless mouse',
                'description' => 'The most advanced master series mouse yet. Features quiet clicks, 8K DPI tracking, and MagSpeed scrolling. Works on any surface.',
                'price' => 75000,
                'compare_price' => 85000,
                'category_id' => $computing?->id,
                'stock_quantity' => 100,
                'is_featured' => false,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
            ],

            // Electronics
            [
                'name' => 'Sony PlayStation 5',
                'slug' => 'sony-playstation-5',
                'short_description' => 'Next-gen gaming console',
                'description' => 'Experience lightning-fast loading, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio. Enjoy stunning 4K graphics.',
                'price' => 450000,
                'category_id' => $electronics?->id,
                'stock_quantity' => 30,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
            ],
            [
                'name' => 'Sony WH-1000XM5 Headphones',
                'slug' => 'sony-wh-1000xm5',
                'short_description' => 'Industry-leading noise canceling',
                'description' => 'The best noise-canceling headphones with exceptional sound quality, 30-hour battery life, and premium comfort. Perfect for music and calls.',
                'price' => 280000,
                'compare_price' => 320000,
                'category_id' => $electronics?->id,
                'stock_quantity' => 45,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            ],
            [
                'name' => 'LG 65" C3 OLED Smart TV',
                'slug' => 'lg-65-c3-oled-tv',
                'short_description' => 'Perfect blacks, infinite contrast',
                'description' => 'Experience perfect black and over a billion colors with LG OLED evo. Features α9 AI Processor Gen6 and webOS 23 smart platform.',
                'price' => 1800000,
                'compare_price' => 2000000,
                'category_id' => $electronics?->id,
                'stock_quantity' => 10,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
            ],
            [
                'name' => 'Apple AirPods Pro 2',
                'slug' => 'apple-airpods-pro-2',
                'short_description' => 'Adaptive Audio, USB-C',
                'description' => 'Rebuilt from the sound up. Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio deliver an unparalleled experience.',
                'price' => 180000,
                'category_id' => $electronics?->id,
                'stock_quantity' => 80,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
            ],
            [
                'name' => 'JBL Flip 6 Bluetooth Speaker',
                'slug' => 'jbl-flip-6-speaker',
                'short_description' => 'Portable waterproof speaker',
                'description' => 'Bold sound for every adventure. IP67 waterproof and dustproof, 12 hours playtime, and JBL Original Pro Sound.',
                'price' => 85000,
                'compare_price' => 95000,
                'category_id' => $electronics?->id,
                'stock_quantity' => 60,
                'is_featured' => false,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
            ],

            // Fashion
            [
                'name' => 'Nike Air Max 270',
                'slug' => 'nike-air-max-270',
                'short_description' => 'Iconic lifestyle sneakers',
                'description' => 'The Nike Air Max 270 delivers visible cushioning under every step with the first-ever Max Air unit created specifically for Nike Sportswear.',
                'price' => 85000,
                'compare_price' => 95000,
                'category_id' => $fashion?->id,
                'stock_quantity' => 100,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
            ],
            [
                'name' => 'Adidas Ultraboost 23',
                'slug' => 'adidas-ultraboost-23',
                'short_description' => 'Premium running shoes',
                'description' => 'Experience incredible energy return with BOOST midsole. Features Primeknit+ upper for adaptive support and comfort.',
                'price' => 120000,
                'category_id' => $fashion?->id,
                'stock_quantity' => 75,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
            ],
            [
                'name' => 'Ray-Ban Aviator Classic',
                'slug' => 'ray-ban-aviator-classic',
                'short_description' => 'Timeless sunglasses',
                'description' => 'The iconic Ray-Ban Aviator. Originally designed for U.S. aviators in 1937, these sunglasses remain a timeless style statement.',
                'price' => 95000,
                'compare_price' => 110000,
                'category_id' => $fashion?->id,
                'stock_quantity' => 50,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
            ],
            [
                'name' => 'Casio G-Shock GA-2100',
                'slug' => 'casio-g-shock-ga2100',
                'short_description' => 'Tough carbon core guard',
                'description' => 'The CasiOak. Features carbon core guard structure, shock resistance, 200m water resistance, and world time function.',
                'price' => 65000,
                'category_id' => $fashion?->id,
                'stock_quantity' => 40,
                'is_featured' => false,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            ],
            [
                'name' => 'Premium Leather Backpack',
                'slug' => 'premium-leather-backpack',
                'short_description' => 'Genuine leather daypack',
                'description' => 'Handcrafted from premium full-grain leather. Features padded laptop compartment, multiple pockets, and adjustable straps.',
                'price' => 75000,
                'compare_price' => 90000,
                'category_id' => $fashion?->id,
                'stock_quantity' => 35,
                'is_featured' => false,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
            ],

            // Home & Living
            [
                'name' => 'Philips Air Fryer XXL',
                'slug' => 'philips-air-fryer-xxl',
                'short_description' => 'Healthy frying technology',
                'description' => 'Fry with up to 90% less fat. XXL capacity perfect for family meals. Features Rapid Air technology and digital display.',
                'price' => 145000,
                'compare_price' => 165000,
                'category_id' => $homeLiving?->id,
                'stock_quantity' => 25,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
            ],
            [
                'name' => 'Dyson V15 Detect Vacuum',
                'slug' => 'dyson-v15-detect',
                'short_description' => 'Intelligent cordless vacuum',
                'description' => 'Reveals invisible dust with a laser. Powerful Dyson Hyperdymium motor, up to 60 minutes runtime, and LCD screen shows real-time data.',
                'price' => 450000,
                'category_id' => $homeLiving?->id,
                'stock_quantity' => 15,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80',
            ],
            [
                'name' => 'Nespresso Vertuo Coffee Machine',
                'slug' => 'nespresso-vertuo-coffee',
                'short_description' => 'Barista-quality coffee at home',
                'description' => 'Centrifusion technology reads each capsule barcode to deliver perfect coffee every time. Makes both coffee and espresso.',
                'price' => 185000,
                'compare_price' => 210000,
                'category_id' => $homeLiving?->id,
                'stock_quantity' => 20,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&q=80',
            ],

            // Health & Beauty
            [
                'name' => 'Dyson Airwrap Complete',
                'slug' => 'dyson-airwrap-complete',
                'short_description' => 'Multi-styler and dryer',
                'description' => 'Style and dry simultaneously with no extreme heat. Multiple attachments for different styles. Engineered for all hair types.',
                'price' => 380000,
                'category_id' => $healthBeauty?->id,
                'stock_quantity' => 12,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800&q=80',
            ],
            [
                'name' => 'Apple Watch Series 9',
                'slug' => 'apple-watch-series-9',
                'short_description' => 'Smarter, brighter, mightier',
                'description' => 'Advanced health features including blood oxygen, ECG, and temperature sensing. S9 chip enables new Double Tap gesture.',
                'price' => 350000,
                'compare_price' => 380000,
                'category_id' => $healthBeauty?->id,
                'stock_quantity' => 40,
                'is_featured' => true,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
            ],
            [
                'name' => 'Oral-B iO Series 9 Electric Toothbrush',
                'slug' => 'oral-b-io-series-9',
                'short_description' => 'AI-powered brushing',
                'description' => '3D teeth tracking with AI recognition. Micro-vibrating bristles for professional clean feeling. Interactive display.',
                'price' => 125000,
                'compare_price' => 145000,
                'category_id' => $healthBeauty?->id,
                'stock_quantity' => 30,
                'is_featured' => false,
                'is_active' => true,
                'image' => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
            ],
        ];

        foreach ($products as $productData) {
            $imageUrl = $productData['image'];
            unset($productData['image']);

            $product = Product::updateOrCreate(
                ['slug' => $productData['slug']],
                $productData
            );

            // Create primary image if it doesn't exist
            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'is_primary' => true],
                [
                    'image_path' => $imageUrl,
                    'alt_text' => $productData['name'],
                    'sort_order' => 0,
                ]
            );
        }

        // Create sample coupons
        Coupon::updateOrCreate(
            ['code' => 'WELCOME20'],
            [
                'description' => '20% off for new customers',
                'type' => 'percentage',
                'value' => 20,
                'minimum_order_amount' => 10000,
                'maximum_discount_amount' => 50000,
                'usage_limit' => 1000,
                'usage_limit_per_user' => 1,
                'is_active' => true,
                'expires_at' => now()->addMonths(3),
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'SAVE5000'],
            [
                'description' => '₦5,000 off orders above ₦50,000',
                'type' => 'fixed',
                'value' => 5000,
                'minimum_order_amount' => 50000,
                'usage_limit' => 500,
                'is_active' => true,
                'expires_at' => now()->addMonth(),
            ]
        );

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin login: admin@naijashop.com / password');
        $this->command->info('Customer login: customer@naijashop.com / password');
    }
}
