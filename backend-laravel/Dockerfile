FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-scripts --ignore-platform-reqs

FROM php:8.3-apache AS runner
RUN docker-php-ext-install pdo_mysql \
 && a2enmod rewrite headers \
 && printf 'upload_max_filesize=5M\npost_max_size=6M\n' > /usr/local/etc/php/conf.d/uploads.ini
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
 && sed -ri "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
WORKDIR /var/www/html
COPY --from=vendor /app ./
RUN php artisan package:discover --ansi \
 && mkdir -p storage/app/uploads \
 && chown -R www-data:www-data storage bootstrap/cache
EXPOSE 80
CMD ["sh", "-c", "php artisan migrate --force && apache2-foreground"]
