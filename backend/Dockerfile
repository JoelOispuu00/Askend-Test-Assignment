# Use the official PHP 8.2 image as a base image
FROM php:8.2-fpm-alpine

# Install necessary dependencies
RUN apk update && apk add --no-cache \
    libpq-dev \
    gawk \
    bash

# Install PHP extensions for PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Set the working directory in the container
WORKDIR /var/www/html

# Copy the current directory contents into the container
COPY . .

# Install PHP dependencies (if any)
RUN composer install

# Expose port 9000 for the PHP-FPM server
EXPOSE 9000

CMD ["php-fpm"]