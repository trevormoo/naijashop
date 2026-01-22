#!/bin/sh
set -e

echo "Starting NaijaShop API..."

# Map DATABASE_URL to DB_URL for Laravel (Render provides DATABASE_URL)
if [ -n "$DATABASE_URL" ] && [ -z "$DB_URL" ]; then
    export DB_URL="$DATABASE_URL"
    echo "Mapped DATABASE_URL to DB_URL"
fi

# Wait for database to be ready
echo "Waiting for database connection..."
sleep 5

# Run migrations
echo "Running migrations..."
php artisan migrate --force || echo "Migration failed or already up to date"

# Seed database (only if tables are empty)
echo "Seeding database..."
php artisan db:seed --force || echo "Seeding skipped"

# Cache config for production
echo "Caching configuration..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Start the server
echo "Starting server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
