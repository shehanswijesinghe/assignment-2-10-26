<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\JwtAuth;
use App\Http\Middleware\LogRequests;
use App\Support\ApiResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api', // all routes live under /api/...
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->prepend(LogRequests::class); // outermost: request id + one log line per request
        $middleware->alias([
            'jwt' => JwtAuth::class,
            'role' => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Every error, whatever its origin, leaves as {success:false, code, data:null, details?}.
        $exceptions->shouldRenderJsonWhen(fn () => true);
        $exceptions->dontReport([ApiException::class]);
        $exceptions->render(fn (Throwable $e, Request $request) => ApiResponse::fromThrowable($e));
    })
    ->create();
