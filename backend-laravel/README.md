# backend-laravel

Laravel 12 API for the assignment (JWT auth, email OTP, admin approval, user management, profile pictures). It is the only backend of the project; the Next.js app in `../frontend` talks to it at `http://localhost:4000/api`.

> **Status:** written without PHP/Composer/network, so `composer install`, `php artisan` and the Docker build have **not been run**. Expect small fixes on first run; commit `composer.lock` afterwards.

## Run
```bash
cd .. && APP_ENV=development docker compose up --build      # whole stack from the repository root
# or locally (PHP >= 8.2 with pdo_mysql, mbstring, openssl, fileinfo; MySQL on localhost:3306)
composer install
APP_ENV=development php artisan migrate                      # tables + admin seed
APP_ENV=development php artisan serve --port=4000
```
Seeded admin: `admin@assignment.local` / `Admin@12345` (change immediately). Development emails, including OTP codes, are printed in the log.

## Structure
```
app/Enums            Role, UserStatus (+ allowed transitions)
app/Support          ResponseCode (all codes), ApiResponse (envelope + error mapping)
app/Exceptions       ApiException (code + HTTP status)
app/Http/Requests    validation, strict keys, {field,code,params} details
app/Http/Middleware  JwtAuth (stateless JWT, re-checks DB), EnsureRole, LogRequests
app/Http/Controllers Auth, User, Admin, File (thin)
app/Services         Auth, Admin, Product (shop + admin + ratings + categories), Profile, ObjectStorage (S3-shaped), Jwt, Mail
routes/api.php       all routes; bootstrap/app.php: exception -> envelope wiring
config/assignment.php  app settings; config/filesystems.php  local + s3 disks
```

## Environments and migrations
`.env.development|staging|production`, selected by `APP_ENV` (variables in [../docs/ENVIRONMENTS.md](../docs/ENVIRONMENTS.md)).
```bash
APP_ENV=staging php artisan migrate --force      # apply
php artisan make:migration add_x_to_users_table  # new migration (never edit an applied one)
```
Migrations: users, email_otps, admin seed, profile image columns, categories, products, product_images, product_ratings. The container runs `migrate --force` on start.

## Endpoints, codes, storage
- Endpoint list, envelope, response and validation codes: [../docs/API.md](../docs/API_&_CODES.md)
- Profile image upload/get/delete and the AWS S3 switch: [../docs/STORAGE.md](../docs/STORAGE.md)
- Schema and status lifecycle: [../docs/DATABASE.md](../docs/DATABASE.md); decisions and trade-offs: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

## Errors, validation and logging
- **One response format for every JSON response** (success, validation, auth, 404, 405, 413, 429, 500): `{success, code, data, meta?, details?}`.
- **Validation returns codes, not text**: `details: [{field, code, params?}]`. The rule -> code mapping is `ApiRequest::messages()` (requests override it and merge with `parent::messages()`).
- **Logs**: `LogRequests` adds a request id (accepts the frontend's `X-Request-Id`) to every line and writes one line per request; handled errors log at WARNING with their code, unexpected ones at ERROR with the stack, business events at INFO with `userId` only.

## Smoke test
```bash
curl -s localhost:4000/api/health
TOKEN=$(curl -s -X POST localhost:4000/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"admin@assignment.local","password":"Admin@12345"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')
curl -s -X POST localhost:4000/api/files/profile-images -H "Authorization: Bearer $TOKEN" -F file=@photo.jpg
```
