# NaijaShop - E-commerce Platform

A complete e-commerce platform built with Laravel 11 (Backend API) and React with TypeScript (Frontend).

## Project Structure

```
NaijaShop/
├── backend/          # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Notifications/
│   │   └── Policies/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   └── routes/
├── frontend/         # React TypeScript App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── public/
└── README.md
```

## Features

### Customer Features
- User registration and authentication
- Email verification
- Product browsing with search and filters
- Product categories with hierarchy
- Shopping cart with persistence
- Discount coupon system
- Secure checkout process
- Paystack payment integration
- Order tracking
- Order history
- Product reviews and ratings
- Wishlist
- Recently viewed products
- Newsletter subscription

### Admin Features
- Dashboard with analytics
- Product management (CRUD, bulk actions, image uploads)
- Category management with hierarchy
- Order management with status updates
- Customer management
- Coupon management
- Sales reports
- Low stock alerts
- Refund processing

## Tech Stack

### Backend
- **Framework:** Laravel 11
- **Authentication:** Laravel Sanctum
- **Database:** MySQL
- **Payment:** Paystack
- **PDF Generation:** DomPDF
- **Image Processing:** Intervention Image
- **Queue:** Database driver

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Routing:** React Router v6
- **State Management:** React Context + React Query
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React

## Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn
- MySQL 8.0+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
DB_DATABASE=naijashop
DB_USERNAME=your_username
DB_PASSWORD=your_password

PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Run migrations and seeders:
```bash
php artisan migrate --seed
```

7. Create storage link:
```bash
php artisan storage:link
```

8. Start the development server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure the API URL in `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get authenticated user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password

### Products Endpoints
- `GET /api/products` - List products (with filters)
- `GET /api/products/featured` - Featured products
- `GET /api/products/search` - Search products
- `GET /api/products/{slug}` - Product details
- `GET /api/products/{slug}/related` - Related products
- `GET /api/products/{slug}/reviews` - Product reviews

### Categories Endpoints
- `GET /api/categories` - List categories
- `GET /api/categories/tree` - Category tree
- `GET /api/categories/featured` - Featured categories
- `GET /api/categories/{slug}` - Category details
- `GET /api/categories/{slug}/products` - Category products

### Cart Endpoints
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add item
- `PUT /api/cart/update/{id}` - Update quantity
- `DELETE /api/cart/remove/{id}` - Remove item
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/apply-coupon` - Apply coupon
- `DELETE /api/cart/remove-coupon` - Remove coupon

### Order Endpoints
- `GET /api/orders` - List user orders
- `GET /api/orders/{id}` - Order details
- `POST /api/orders/{id}/cancel` - Cancel order
- `GET /api/orders/{id}/track` - Track order
- `GET /api/orders/{id}/invoice` - Download invoice

### Payment Endpoints
- `POST /api/payments/initialize` - Initialize Paystack payment
- `GET /api/payments/verify/{reference}` - Verify payment
- `POST /api/webhooks/paystack` - Paystack webhook

### Admin Endpoints
All admin endpoints are prefixed with `/api/admin` and require admin authentication.

- Dashboard: `GET /api/admin/dashboard`
- Products: Full CRUD at `/api/admin/products`
- Categories: Full CRUD at `/api/admin/categories`
- Orders: `/api/admin/orders`
- Users: `/api/admin/users`
- Coupons: `/api/admin/coupons`
- Reports: `/api/admin/reports/*`

## Database Schema

### Core Tables
- `users` - User accounts
- `products` - Product information
- `categories` - Product categories (hierarchical)
- `product_images` - Product images

### E-commerce Tables
- `carts` - Shopping carts
- `cart_items` - Cart line items
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records
- `refunds` - Refund records

### Additional Tables
- `coupons` - Discount coupons
- `coupon_usages` - Coupon usage tracking
- `reviews` - Product reviews
- `review_votes` - Review helpfulness votes
- `wishlists` - User wishlists
- `recently_viewed` - Recently viewed products
- `newsletter_subscribers` - Newsletter subscriptions

## Paystack Integration

### Configuration
Set your Paystack keys in `.env`:
```env
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PAYMENT_URL=https://api.paystack.co
```

### Payment Flow
1. User completes checkout
2. Order is created with pending payment status
3. Frontend calls `/api/payments/initialize` to get Paystack authorization URL
4. User is redirected to Paystack checkout
5. After payment, user is redirected back to callback URL
6. Backend verifies payment via `/api/payments/verify/{reference}`
7. On success, order status is updated and confirmation email sent

### Webhook
Configure webhook URL in Paystack dashboard:
```
https://yourdomain.com/api/webhooks/paystack
```

## Email Notifications

The following email notifications are sent:
- **Order Confirmation** - When order is placed and paid
- **Order Status Update** - When order status changes
- **Password Reset** - When password reset is requested
- **Email Verification** - When user registers

### Queue Configuration
For production, configure queue worker:
```bash
php artisan queue:work
```

## Testing

### Backend Tests
Run the PHPUnit test suite:
```bash
cd backend
./vendor/bin/phpunit --testdox
```

**Test Coverage:**
- Authentication tests (register, login, profile)
- Product API tests (listing, search, filtering)
- Cart functionality tests
- Product model unit tests

### Running Tests with Docker
```bash
docker-compose exec backend ./vendor/bin/phpunit
```

## Deployment

### Option 1: Docker Deployment (Recommended)

1. Copy the environment file:
```bash
cp .env.docker .env
```

2. Update environment variables in `.env`:
```env
DB_PASSWORD=your_secure_password
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx
VITE_API_URL=https://api.yourdomain.com/api
```

3. Build and start containers:
```bash
docker-compose up -d --build
```

4. Run migrations:
```bash
docker-compose exec backend php artisan migrate --seed
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/api/health

### Option 2: Manual Deployment

#### Backend
1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Run `composer install --optimize-autoloader --no-dev`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Run `php artisan view:cache`
6. Configure proper queue driver (Redis recommended)
7. Set up supervisor for queue worker

#### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `dist` folder to your web server

### Option 3: Cloud Platform Deployment

**Railway/Render:**
- Connect your GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push to main

**DigitalOcean App Platform:**
- Create new app from GitHub
- Configure backend as web service
- Configure frontend as static site
- Set environment variables

**AWS/GCP/Azure:**
- Use Docker images with container services
- Configure load balancer for high availability
- Set up managed database (RDS/Cloud SQL)

## CI/CD Pipeline

This project includes GitHub Actions workflows for:

### Continuous Integration (`ci.yml`)
- Runs on every push and pull request
- Tests backend with PHP 8.2 and 8.3
- Builds and lints frontend
- Tests Docker build

### Continuous Deployment (`deploy.yml`)
- Triggers on push to main branch
- Builds and pushes Docker images to GitHub Container Registry
- Deploys to production server via SSH

**Required Secrets:**
- `SERVER_HOST` - Production server IP/hostname
- `SERVER_USER` - SSH username
- `SERVER_SSH_KEY` - SSH private key
- `VITE_API_URL` - Production API URL
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key

## Security Considerations

- All API endpoints are rate-limited
- CSRF protection is enabled
- Passwords are hashed using bcrypt
- Sensitive data is encrypted
- Payment webhooks are signature-verified
- Input validation on all endpoints
- SQL injection prevention via Eloquent ORM
- XSS prevention via proper escaping

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Demo Credentials

After running seeders, use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@naijashop.com | password |
| Customer | customer@naijashop.com | password |

**Sample Data Included:**
- 6 Products (Electronics, Fashion, Computing, Gaming)
- 9 Categories (6 main + 3 subcategories)
- 2 Coupons (WELCOME20 - 20% off, SAVE5000 - ₦5,000 off)

## Project Highlights (Portfolio)

### Technical Achievements
- **Full-Stack Development**: Complete e-commerce solution with separate frontend and backend
- **RESTful API Design**: 209 API endpoints following best practices
- **Authentication & Authorization**: Role-based access control with Laravel Sanctum
- **Payment Integration**: Secure Paystack integration with webhook support
- **Database Design**: 17 normalized tables with proper relationships
- **Testing**: Comprehensive PHPUnit test suite with 30+ tests
- **DevOps**: Docker containerization and CI/CD with GitHub Actions

### Key Features Implemented
- Real-time cart management with session/user persistence
- Hierarchical category system with infinite nesting
- Advanced product search and filtering
- Coupon system with usage limits and validation
- Order management with status tracking
- PDF invoice generation
- Email notifications for orders

### Technologies & Tools
- **Backend**: Laravel 11, PHP 8.2, MySQL 8, Redis
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Query
- **DevOps**: Docker, GitHub Actions, Nginx
- **Payment**: Paystack API
- **Testing**: PHPUnit, Factory Pattern

## Screenshots

*Add screenshots of your deployed application here:*

```
screenshots/
├── home.png
├── products.png
├── cart.png
├── checkout.png
├── admin-dashboard.png
└── admin-orders.png
```

## Live Demo

- **Frontend**: [https://naijashop.example.com](https://naijashop.example.com)
- **API Docs**: [https://api.naijashop.example.com](https://api.naijashop.example.com)

## License

This project is licensed under the MIT License.

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [yourportfolio.com](https://yourportfolio.com)

## Support

For support, email support@naijashop.com or open an issue on GitHub.
