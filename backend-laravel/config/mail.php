<?php

return [
    'default' => env('MAIL_MAILER', 'log'),
    'mailers' => [
        'smtp' => [
            'transport' => 'smtp',
            'host' => env('MAIL_HOST', '127.0.0.1'),
            'port' => (int) env('MAIL_PORT', 587),
            'username' => env('MAIL_USERNAME') ?: null,
            'password' => env('MAIL_PASSWORD') ?: null,
            'timeout' => 10,
        ],
        'log' => ['transport' => 'log', 'channel' => env('MAIL_LOG_CHANNEL')],
    ],
    'from' => ['address' => env('MAIL_FROM', 'no-reply@assignment.local'), 'name' => 'Assignment'],
];
