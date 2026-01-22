# NaijaShop - E-commerce Platform

## Project Summary

A full-stack e-commerce platform built for the Nigerian market, featuring secure payment processing, comprehensive admin dashboard, and modern responsive design.

**Live Demo**: [Add your deployed URL here]
**GitHub Repository**: [Add your GitHub URL here]

---

## Technical Overview

### Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│   Backend API   │────▶│    Database     │
│  React + TS     │     │   Laravel 11    │     │     MySQL       │
│  Tailwind CSS   │     │   + Sanctum     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │                      ▼
         │              ┌─────────────────┐
         │              │    Paystack     │
         │              │   Payment API   │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│     Nginx       │
│  (Production)   │
└─────────────────┘
```

### Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Query, React Router v6, Axios, Zod |
| **Backend** | Laravel 11, PHP 8.2+, Laravel Sanctum, Eloquent ORM |
| **Database** | MySQL 8.0, Redis (caching) |
| **Payment** | Paystack API |
| **DevOps** | Docker, GitHub Actions, Nginx |
| **Testing** | PHPUnit (30+ tests) |

---

## Key Features & Implementation Details

### 1. Authentication System
- JWT-based authentication using Laravel Sanctum
- Email verification flow
- Password reset with secure tokens
- Role-based access control (Admin/Customer)

### 2. Product Catalog
- Full-text search with filters (price, category, availability)
- Hierarchical category system (unlimited nesting)
- Product images with primary image selection
- Stock tracking with low-stock alerts

### 3. Shopping Cart
- Session-based cart for guests
- User-linked cart for authenticated users
- Cart merge on login
- Coupon code application

### 4. Checkout & Payment
- Multi-step checkout process
- Secure Paystack integration
- Webhook handling for payment confirmation
- Automatic order status updates

### 5. Order Management
- Order tracking with status history
- PDF invoice generation
- Email notifications (order confirmation, status updates)
- Admin order management with bulk actions

### 6. Admin Dashboard
- Sales analytics and charts
- Product inventory management
- Order processing workflow
- Customer management
- Coupon system with usage tracking

---

## Code Quality & Best Practices

### Backend
- **RESTful API Design**: 209 endpoints following REST conventions
- **Request Validation**: Form Request classes for input validation
- **API Resources**: Consistent JSON response formatting
- **Service Layer**: Business logic separated from controllers
- **Factory Pattern**: Database factories for testing

### Frontend
- **TypeScript**: Full type safety across the application
- **Component Architecture**: Reusable UI components
- **State Management**: React Query for server state, Context for UI state
- **Form Handling**: React Hook Form with Zod validation

### DevOps
- **Docker**: Multi-container setup with docker-compose
- **CI/CD**: Automated testing and deployment with GitHub Actions
- **Environment Configuration**: Secure environment variable handling

---

## Database Schema

17 tables designed with proper normalization:

**Core**: users, products, categories, product_images
**Commerce**: carts, cart_items, orders, order_items, payments, refunds
**Features**: coupons, coupon_usages, reviews, review_votes, wishlists, recently_viewed, newsletter_subscribers

---

## Testing

```bash
# Run tests
./vendor/bin/phpunit --testdox

# Results: 30 tests, 89 assertions, all passing
```

**Test Coverage:**
- Authentication flows (6 tests)
- Product API endpoints (6 tests)
- Cart operations (7 tests)
- Product model unit tests (11 tests)

---

## Metrics

| Metric | Value |
|--------|-------|
| Total API Endpoints | 209 |
| Database Tables | 17 |
| Test Coverage | 30+ tests |
| Frontend Pages | 19 |
| Backend Controllers | 18 |

---

## Challenges & Solutions

### Challenge 1: Session-based Cart for Guests
**Problem**: Managing cart state for unauthenticated users
**Solution**: Implemented session-based carts that merge with user carts upon authentication

### Challenge 2: Real-time Stock Management
**Problem**: Preventing overselling during high traffic
**Solution**: Database transactions with stock quantity checks before order confirmation

### Challenge 3: Payment Webhook Reliability
**Problem**: Ensuring payment status updates even if user closes browser
**Solution**: Paystack webhook integration with signature verification and idempotent processing

---

## Future Improvements

- [ ] Multi-vendor marketplace support
- [ ] Real-time notifications with WebSockets
- [ ] Recommendation engine based on purchase history
- [ ] Mobile app (React Native)
- [ ] Inventory management with barcode scanning

---

## Resume/CV Description

> **NaijaShop - Full-Stack E-commerce Platform**
>
> Developed a production-ready e-commerce platform for the Nigerian market using Laravel 11 and React with TypeScript. Implemented secure Paystack payment integration, role-based authentication, and comprehensive admin dashboard. Built CI/CD pipeline with GitHub Actions and containerized the application with Docker. Achieved 100% test pass rate with 30+ PHPUnit tests.
>
> **Technologies**: Laravel 11, React 18, TypeScript, MySQL, Redis, Docker, GitHub Actions, Paystack API

---

## Contact

- **GitHub**: [Your GitHub]
- **LinkedIn**: [Your LinkedIn]
- **Email**: [Your Email]
- **Portfolio**: [Your Portfolio URL]
