# Assignment - Next.js + Laravel

Two Dockerized apps: 

1.`frontend/` (Next.js 16)

2.`backend-laravel/` (Laravel 12, MySQL)

## Quick start (Docker)

backend-laravel .env file configs (change.env.production)
```bash
# Add mysql url
DATABASE_URL=mysql://'change_here':'change_here'@localhost:3306/'change_here'

#Add mail configurations
MAIL_MAILER=smtp
MAIL_FROM=no-reply@assignment.local
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
```

```bash
APP_ENV=production docker compose up --build
or
$env:APP_ENV='production';
docker compose up --build
```


## Quick start (Local)

You need:
PHP, Composer, MySQL running on localhost:3306 (empty database), Node.js in your local computer


backend-laravel .env file configs (change .env.develpment)
```bash
# Add mysql url
DATABASE_URL=mysql://'change_here':'change_here'@localhost:3306/'change_here'

#Add mail configurations
MAIL_MAILER=smtp
MAIL_FROM=no-reply@assignment.local
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
```


```bash
cd backend-laravel
composer install

export APP_ENV=development (mac) or $env:APP_ENV='development'; (windows)
php artisan migrate
php artisan serve --port=4000

cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |

Health Check:
```bash
curl -s localhost:4000/api/health
```

## Admin Login
1. goto `http://localhost:3000/` and Click login (top right corner) or `http://localhost:3000/login`
2. Use the Admin Credentials : UN: `admin@assignment.local` | PW: `Admin@12345`

## New User Registration flow
1. Register at `/register` -> read the OTP in the backend log or email if configed -> enter it at `/verify-email` (5 min validity, "Resend code" available).
2. Sign in as admin -> **Users** -> *Activate* the user.

## Add/edit Product flow
1. As admin: **Product management -> Products -> Add/edit products**. 
change status, make product draft

## View products/product and Rating Products flow
1. Anyone (no login) can browse the shop at `http://localhost:3000`.
2. Logged-in users also browse the shop and can rate a product(in side of the product). by visting: http://localhost:3000


## Other Dcuments

1.[AUTHENTICATION_IMAGE_ARCHITECH.md](docs/AUTHENTICATION_IMAGE_ARCHITECH.md)

Authentication Approach, Image Handling Approach, Key Architectural Decisions

2.[API_&_CODES.md](docs/API_&_CODES.md)

API Details, Error Codes, Response Codes, Validation codes
