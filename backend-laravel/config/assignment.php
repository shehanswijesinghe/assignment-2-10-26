<?php

return [
    'jwt_secret' => env('JWT_SECRET'),
    'jwt_expires_in' => env('JWT_EXPIRES_IN', '1d'),
    'otp_ttl_seconds' => (int) env('OTP_TTL_SECONDS', 300),
    'otp_resend_cooldown_seconds' => (int) env('OTP_RESEND_COOLDOWN_SECONDS', 60),
    'frontend_login_url' => env('FRONTEND_LOGIN_URL', 'http://localhost:3000/login'),

    'storage' => [
        'disk' => env('FILESYSTEM_DISK', 'local'),
        'base_url' => env('STORAGE_BASE_URL', rtrim(env('APP_URL', 'http://localhost:4000'), '/').'/api/files'),
        'avatar_max_kb' => (int) env('AVATAR_MAX_KB', 2048),
    ],
];
