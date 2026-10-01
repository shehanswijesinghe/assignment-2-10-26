<?php

use Monolog\Formatter\JsonFormatter;
use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;

$formatter = env('LOG_FORMAT', 'line') === 'json' ? JsonFormatter::class : null;
$level = env('LOG_LEVEL', 'debug');

return [
    'default' => env('LOG_CHANNEL', 'stack'),
    'deprecations' => ['channel' => 'null', 'trace' => false],
    'channels' => [
        'stack' => ['driver' => 'stack', 'channels' => explode(',', env('LOG_STACK', 'stderr,daily')), 'ignore_exceptions' => false],
        'stderr' => ['driver' => 'monolog', 'level' => $level, 'handler' => StreamHandler::class, 'with' => ['stream' => 'php://stderr'], 'formatter' => $formatter],
        'daily' => ['driver' => 'daily', 'path' => storage_path('logs/laravel.log'), 'level' => $level, 'days' => 14, 'replace_placeholders' => true, 'formatter' => $formatter],
        'single' => ['driver' => 'single', 'path' => storage_path('logs/laravel.log'), 'level' => $level],
        'null' => ['driver' => 'monolog', 'handler' => NullHandler::class],
    ],
];
